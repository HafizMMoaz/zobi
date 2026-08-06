"""Tests for pinning a turn to one tool.

The palette guarantees which tool runs, not that the turn is a single call, so
the pin has to be released after the first model call. A pin that persisted
would compel the tool on every step and leave the model no step in which to
write a closing answer.
"""

from typing import Any

from pytest_mock import MockerFixture

from zobi.agent.permissions import AgentMode, ToolRisk
from zobi.agent.runtime import AgentTurn
from zobi.agent.tools import AgentTool


def _tool(name: str = "list_datasets") -> AgentTool:
    return AgentTool(
        name=name,
        description="List datasets",
        parameters={"type": "object", "properties": {}},
        risk=ToolRisk.READ,
        title="List datasets",
    )


def _plain_reply() -> Any:
    """A stream that yields one chunk of text and no tool calls."""
    return iter(())


def test_first_model_call_pins_the_forced_tool(mocker: MockerFixture) -> None:
    mocker.patch("zobi.agent.runtime.list_tools", return_value=[_tool()])
    mocker.patch(
        "zobi.agent.runtime._consume_stream",
        return_value=iter([("final", ("done", []))]),
    )
    completion = mocker.patch(
        "zobi.agent.runtime.chat_completion", return_value=_plain_reply()
    )

    turn = AgentTurn([], AgentMode.MANUAL, force_tool="list_datasets")
    list(turn.run())

    assert completion.call_args.kwargs["tool_choice"] == {
        "type": "function",
        "function": {"name": "list_datasets"},
    }


def test_later_calls_in_the_turn_release_the_pin(
    mocker: MockerFixture,
) -> None:
    mocker.patch("zobi.agent.runtime.list_tools", return_value=[_tool()])
    call = {
        "id": "call_1",
        "type": "function",
        "function": {"name": "list_datasets", "arguments": "{}"},
    }
    mocker.patch(
        "zobi.agent.runtime._consume_stream",
        side_effect=[
            iter([("final", ("", [call]))]),
            iter([("final", ("all done", []))]),
        ],
    )
    mocker.patch("zobi.agent.runtime.call_tool", return_value=(True, "two datasets"))
    completion = mocker.patch(
        "zobi.agent.runtime.chat_completion", return_value=_plain_reply()
    )

    turn = AgentTurn([], AgentMode.AUTO, force_tool="list_datasets")
    list(turn.run())

    assert completion.call_count == 2
    assert "tool_choice" in completion.call_args_list[0].kwargs
    assert "tool_choice" not in completion.call_args_list[1].kwargs


def test_no_forced_tool_sends_no_tool_choice(mocker: MockerFixture) -> None:
    mocker.patch("zobi.agent.runtime.list_tools", return_value=[_tool()])
    mocker.patch(
        "zobi.agent.runtime._consume_stream",
        return_value=iter([("final", ("done", []))]),
    )
    completion = mocker.patch(
        "zobi.agent.runtime.chat_completion", return_value=_plain_reply()
    )

    turn = AgentTurn([], AgentMode.MANUAL)
    list(turn.run())

    assert "tool_choice" not in completion.call_args.kwargs


def test_a_tool_missing_from_the_mode_errors_without_calling_the_model(
    mocker: MockerFixture,
) -> None:
    """Reachable without a bug: the mode can be lowered after the palette drew.

    Forwarding an unknown name would surface as an opaque provider-side 400.
    """
    mocker.patch("zobi.agent.runtime.list_tools", return_value=[_tool()])
    completion = mocker.patch("zobi.agent.runtime.chat_completion")

    turn = AgentTurn([], AgentMode.READ_ONLY, force_tool="drop_table")
    events = list(turn.run())

    assert completion.call_count == 0
    assert events[0].type == "error"
    # TurnEvent names its payload field `data`, not `payload`.
    assert "drop_table" in events[0].data["message"]
