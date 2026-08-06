"""Drives one agent turn and reports what happens as it happens.

A turn is: send the conversation to the model, stream its reply, run whatever
tools it asks for, feed the results back, repeat until it stops asking. The
loop yields events throughout so the caller can push them down an SSE stream
rather than waiting for a final answer.

Everything here is synchronous. LiteLLM's streaming API is a plain generator,
Flask serves the stream from a worker thread, and the async MCP calls are
bridged in ``tools``. Introducing async at this layer would buy nothing and
complicate the request lifecycle.
"""

from __future__ import annotations

import logging
from collections.abc import Iterator
from dataclasses import dataclass, field
from typing import Any

from zobi.agent.permissions import AgentMode, evaluate
from zobi.agent.tools import AgentTool, call_tool, list_tools, parse_arguments
from zobi.llm.service import chat_completion
from zobi.utils import json

logger = logging.getLogger(__name__)

#: Ceiling on tool round trips in a single turn. A model that has not finished
#: after this many steps is looping, and each step costs a model call.
MAX_TOOL_ITERATIONS = 8

SYSTEM_PROMPT = """\
You are Zobi, the assistant built into the Zobi business intelligence platform.

You help people understand their data. You can list and inspect databases,
datasets, charts and dashboards, run queries, and build charts and dashboards,
using the tools available to you.

How to work:
- Prefer looking things up over guessing. If you need a dataset's columns,
  fetch them rather than assuming names.
- When you report numbers, say where they came from.
- Keep answers short. Lead with the answer, then the detail that supports it.
- Use markdown tables for tabular results.
- If a tool fails, read the error and try a different approach rather than
  repeating the same call.
- If a request is ambiguous in a way that changes the answer, ask.

You are acting on behalf of the signed-in user and can only reach what their
permissions allow. Some actions need their approval before they run; when one
is declined, respect it and offer an alternative rather than retrying.
"""


@dataclass
class ToolCallRequest:
    """A tool call the model has asked for."""

    id: str
    name: str
    arguments: dict[str, Any]
    tool: AgentTool | None = None

    @property
    def title(self) -> str:
        return self.tool.title if self.tool else self.name


@dataclass
class TurnEvent:
    """Something worth telling the client about."""

    #: "token" | "tool_start" | "tool_result" | "approval_required"
    #: | "message_complete" | "error" | "done"
    type: str
    data: dict[str, Any] = field(default_factory=dict)

    def to_sse(self) -> str:
        """Serialize as a Server-Sent Event frame."""
        return f"data: {json.dumps({'type': self.type, **self.data})}\n\n"


def _consume_stream(stream: Any) -> Iterator[tuple[str, Any]]:
    """Turn a LiteLLM stream into ``(kind, payload)`` pairs.

    Yields ``("token", text)`` as content arrives, then exactly one
    ``("final", (content, tool_calls))`` when the stream ends.

    Tool calls arrive fragmented across chunks: the name comes early, the
    arguments accumulate character by character, and the index identifies
    which call a fragment belongs to. They are reassembled here so the rest of
    the loop sees whole calls.
    """
    content_parts: list[str] = []
    calls: dict[int, dict[str, Any]] = {}

    for chunk in stream:
        choices = getattr(chunk, "choices", None)
        if not choices:
            continue
        delta = getattr(choices[0], "delta", None)
        if delta is None:
            continue

        if token := getattr(delta, "content", None):
            content_parts.append(token)
            yield "token", token

        for fragment in getattr(delta, "tool_calls", None) or []:
            index = getattr(fragment, "index", 0) or 0
            call = calls.setdefault(
                index,
                {
                    "id": "",
                    "type": "function",
                    "function": {"name": "", "arguments": ""},
                },
            )
            if fragment_id := getattr(fragment, "id", None):
                call["id"] = fragment_id
            function = getattr(fragment, "function", None)
            if function is None:
                continue
            if name := getattr(function, "name", None):
                call["function"]["name"] = name
            if arguments := getattr(function, "arguments", None):
                call["function"]["arguments"] += arguments

    ordered = [calls[index] for index in sorted(calls)]
    yield "final", ("".join(content_parts), ordered)


class AgentTurn:
    """One user message, and everything Zobi does in response.

    ``pending_approvals`` is how a paused turn resumes: when a tool needs the
    user's consent, the turn stops and records enough to run it later without
    replaying the model call that proposed it.
    """

    def __init__(
        self,
        messages: list[dict[str, Any]],
        mode: AgentMode,
        model_alias: str | None = None,
    ):
        self.mode = mode
        self.model_alias = model_alias
        self.messages = messages
        self.tools = list_tools(mode)
        self._tools_by_name = {tool.name: tool for tool in self.tools}
        # Filled in by _stream_once for the current step.
        self._content: str = ""
        self._calls: list[dict[str, Any]] = []
        self._failed: bool = False

    def _model_payload(self) -> list[dict[str, Any]]:
        return [{"role": "system", "content": SYSTEM_PROMPT}, *self.messages]

    def _stream_once(self) -> Iterator[TurnEvent]:
        """Call the model once, yielding token events as text arrives.

        The assembled reply lands on ``self._content`` and ``self._calls``
        rather than being yielded: a generator that emits two different kinds
        of value forces every caller to branch on type.

        Failures are yielded as error events rather than raised so the caller
        stays a plain generator and the SSE stream always closes tidily.
        """
        self._content = ""
        self._calls = []
        self._failed = False

        try:
            stream = chat_completion(
                self._model_payload(),
                alias=self.model_alias,
                stream=True,
                tools=[tool.to_openai_schema() for tool in self.tools] or None,
            )
        except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
            logger.exception("Model call failed: %s", type(ex).__name__)
            self._failed = True
            yield TurnEvent("error", {"message": str(ex)})
            return

        try:
            for kind, payload in _consume_stream(stream):
                if kind == "token":
                    yield TurnEvent("token", {"text": payload})
                else:
                    self._content, self._calls = payload
        except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
            logger.exception("Stream failed: %s", type(ex).__name__)
            self._failed = True
            yield TurnEvent("error", {"message": str(ex)})

    def run(self) -> Iterator[TurnEvent]:
        """Execute the turn, yielding events as they occur."""
        for _step in range(MAX_TOOL_ITERATIONS):
            yield from self._stream_once()
            if self._failed:
                return

            content, raw_calls = self._content, self._calls

            assistant_message: dict[str, Any] = {
                "role": "assistant",
                "content": content,
            }
            if raw_calls:
                assistant_message["tool_calls"] = raw_calls
            self.messages.append(assistant_message)

            yield TurnEvent(
                "message_complete",
                {"content": content, "tool_calls": raw_calls},
            )

            if not raw_calls:
                yield TurnEvent("done", {})
                return

            paused = False
            for event in self._dispatch_calls(raw_calls):
                yield event
                if event.type == "approval_required":
                    paused = True

            if paused:
                # Stop without a "done": the client resumes the turn once the
                # user has answered, and the transcript already holds the
                # assistant message that proposed the call.
                return

        yield TurnEvent(
            "error",
            {
                "message": (
                    f"Stopped after {MAX_TOOL_ITERATIONS} tool steps without "
                    "reaching an answer."
                )
            },
        )

    def _dispatch_calls(self, raw_calls: list[dict[str, Any]]) -> Iterator[TurnEvent]:
        """Gate and run every tool call the model asked for, in order."""
        for call in raw_calls:
            name = call["function"]["name"]
            yield from self._handle_call(
                ToolCallRequest(
                    id=call.get("id") or "",
                    name=name,
                    arguments=parse_arguments(call["function"].get("arguments")),
                    tool=self._tools_by_name.get(name),
                )
            )

    def _handle_call(self, request: ToolCallRequest) -> Iterator[TurnEvent]:
        """Gate one tool call, and run it when allowed."""
        if request.tool is None:
            # The model asked for something not on offer, usually a
            # hallucinated name or a write tool in read-only mode. Answer the
            # call so the transcript stays well formed, and let it recover.
            self._append_tool_result(
                request, f"'{request.name}' is not available in this mode."
            )
            yield TurnEvent(
                "tool_result",
                {
                    "id": request.id,
                    "name": request.name,
                    "ok": False,
                    "output": "Tool not available",
                },
            )
            return

        decision = evaluate(self.mode, request.tool.risk)

        if decision.needs_approval:
            yield TurnEvent(
                "approval_required",
                {
                    "id": request.id,
                    "name": request.name,
                    "title": request.title,
                    "risk": request.tool.risk.value,
                    "arguments": request.arguments,
                    "description": request.tool.description[:400],
                },
            )
            return

        if not decision.allowed:
            self._append_tool_result(request, decision.reason)
            yield TurnEvent(
                "tool_result",
                {
                    "id": request.id,
                    "name": request.name,
                    "ok": False,
                    "output": decision.reason,
                },
            )
            return

        yield TurnEvent(
            "tool_start",
            {
                "id": request.id,
                "name": request.name,
                "title": request.title,
                "risk": request.tool.risk.value,
                "arguments": request.arguments,
            },
        )

        ok, output = call_tool(request.name, request.arguments)
        self._append_tool_result(request, output)
        yield TurnEvent(
            "tool_result",
            {
                "id": request.id,
                "name": request.name,
                "ok": ok,
                "output": output[:4000],
            },
        )

    def _append_tool_result(self, request: ToolCallRequest, output: str) -> None:
        """Record a tool result in the transcript.

        Every requested call needs a matching result message, including
        refusals. A tool_calls message without answers leaves the conversation
        malformed, and providers reject the next request outright.
        """
        self.messages.append(
            {
                "role": "tool",
                "tool_call_id": request.id,
                "content": output,
            }
        )
