"""Bridges the agent to Zobi's in-process MCP server.

The MCP service already exposes every capability the agent needs, with
argument schemas and safety annotations, so nothing is reimplemented here.
This module only translates between two worlds:

- MCP tools are async and described by JSON Schema.
- LiteLLM wants OpenAI-shaped tool definitions and is driven synchronously
  from a Flask request.

Calls are made through ``fastmcp.Client`` against the in-memory server. That
matters for authorization: the MCP auth layer resolves the acting user from
``flask.g.user``, so every tool runs under the requesting user's own RBAC and
the agent structurally cannot reach anything they could not.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import Any

from flask import g

from zobi.agent.permissions import AgentMode, classify, offerable_risks, ToolRisk
from zobi.utils import json

logger = logging.getLogger(__name__)

#: Tools that are real MCP capabilities but noise for a conversation: they
#: describe the server rather than the user's data.
EXCLUDED_TOOLS = {"health_check", "generate_bug_report", "get_instance_info"}

#: Guards a single tool call. Long enough for a real query, short enough that
#: a wedged tool does not hold the SSE stream open indefinitely.
TOOL_TIMEOUT_SECONDS = 120


@dataclass(frozen=True)
class AgentTool:
    """One MCP tool, described the way both the model and the UI need it."""

    name: str
    description: str
    parameters: dict[str, Any]
    risk: ToolRisk
    title: str

    def to_openai_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }


def _run(coro: Any) -> Any:
    """Drive an async MCP call from synchronous Flask code.

    A fresh event loop per call is deliberate. Flask handles each request on a
    worker thread with no running loop, and the in-memory MCP transport is
    cheap to set up, so a persistent loop would add lifecycle complexity for
    no benefit.
    """
    return asyncio.run(coro)


async def _collect_tools() -> list[AgentTool]:
    from zobi.mcp_service.app import mcp  # noqa: PLC0415  # heavy import

    collected: list[AgentTool] = []
    for tool in await mcp.list_tools():
        if tool.name in EXCLUDED_TOOLS:
            continue

        annotations = getattr(tool, "annotations", None)
        risk = classify(
            getattr(annotations, "readOnlyHint", None) if annotations else None,
            getattr(annotations, "destructiveHint", None) if annotations else None,
        )
        schema = getattr(tool, "inputSchema", None) or {
            "type": "object",
            "properties": {},
        }
        collected.append(
            AgentTool(
                name=tool.name,
                description=(tool.description or tool.name).strip(),
                parameters=schema,
                risk=risk,
                title=(getattr(annotations, "title", None) if annotations else None)
                or tool.name.replace("_", " ").capitalize(),
            )
        )
    return collected


def _native_as_agent_tools() -> list[AgentTool]:
    """Native tools, described the same way MCP tools are."""
    from zobi.agent.native_tools import registry  # noqa: PLC0415

    return [
        AgentTool(
            name=tool.name,
            description=tool.description,
            parameters=tool.parameters,
            risk=tool.risk,
            title=tool.title,
        )
        for tool in registry().values()
    ]


def list_tools(mode: AgentMode) -> list[AgentTool]:
    """Tools to advertise to the model for this conversation's mode.

    Merges the MCP server's tools with the in-process native ones. Both are
    filtered by the same risk rules, so a native tool is gated exactly like an
    MCP tool of equivalent risk.
    """
    allowed = offerable_risks(mode)

    try:
        tools = _run(_collect_tools())
    except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
        # A conversation without MCP tools is degraded but still useful, and
        # the native ones may still work, so carry on with an empty list.
        logger.exception("Could not list MCP tools: %s", type(ex).__name__)
        tools = []

    try:
        tools = tools + _native_as_agent_tools()
    except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
        logger.exception("Could not list native tools: %s", type(ex).__name__)

    return [tool for tool in tools if tool.risk in allowed]


def find_tool(name: str, mode: AgentMode) -> AgentTool | None:
    return next((tool for tool in list_tools(mode) if tool.name == name), None)


async def _invoke(name: str, arguments: dict[str, Any]) -> str:
    from fastmcp import Client  # noqa: PLC0415

    from zobi.mcp_service.app import mcp  # noqa: PLC0415

    async with Client(mcp) as client:
        result = await asyncio.wait_for(
            client.call_tool(name, arguments), timeout=TOOL_TIMEOUT_SECONDS
        )

    # MCP returns a list of content blocks; the model only needs their text.
    blocks = getattr(result, "content", result)
    if isinstance(blocks, list):
        parts = [getattr(block, "text", None) or str(block) for block in blocks]
        return "\n".join(part for part in parts if part)
    return str(blocks)


def call_tool(name: str, arguments: dict[str, Any]) -> tuple[bool, str]:
    """Run a tool and return ``(ok, output)``.

    Failures come back as text rather than exceptions because the model is the
    consumer: telling it "that dataset does not exist" lets it recover on the
    next step, whereas raising would abandon the whole turn.

    ``g.user`` must already be set; the MCP auth layer reads it to establish
    who is acting.
    """
    if not getattr(g, "user", None):
        return False, "No authenticated user in context; refusing to run tools."

    from zobi.agent.native_tools import (  # noqa: PLC0415
        get as get_native,
        run as run_native,
    )

    # Native tools run in-process; only MCP names go over the client.
    if get_native(name) is not None:
        return run_native(name, arguments)

    try:
        return True, _invoke_sync(name, arguments)
    except TimeoutError:
        logger.warning("Tool %s timed out after %ss", name, TOOL_TIMEOUT_SECONDS)
        return (
            False,
            f"'{name}' took longer than {TOOL_TIMEOUT_SECONDS}s and was stopped.",
        )
    except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
        logger.warning("Tool %s failed: %s", name, type(ex).__name__)
        return False, f"'{name}' failed: {ex}"


def _invoke_sync(name: str, arguments: dict[str, Any]) -> str:
    return _run(_invoke(name, arguments))


def parse_arguments(raw: str | dict[str, Any] | None) -> dict[str, Any]:
    """Decode the JSON argument blob a model produces.

    Models occasionally emit an empty string or malformed JSON for a
    no-argument call. Treating that as ``{}`` lets the tool apply its own
    defaults instead of failing the turn on a formatting quirk.
    """
    if isinstance(raw, dict):
        return raw
    if not raw:
        return {}
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        logger.warning("Could not parse tool arguments: %r", raw)
        return {}
    return parsed if isinstance(parsed, dict) else {}
