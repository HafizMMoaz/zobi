"""Tests for the agent's autonomy gate.

These matter more than most: a mistake here means Zobi changes or deletes
something without being asked. The gate sits on top of Zobi's normal RBAC
rather than replacing it, so these tests are about *intent*, not about what
the user is allowed to reach.
"""

import pytest

from zobi.agent.permissions import (
    AgentMode,
    classify,
    evaluate,
    offerable_risks,
    parse_mode,
    ToolRisk,
)


@pytest.mark.parametrize(
    "read_only,destructive,expected",
    [
        (True, False, ToolRisk.READ),
        # readOnly wins: something that cannot write cannot destroy.
        (True, True, ToolRisk.READ),
        (False, True, ToolRisk.DESTRUCTIVE),
        (False, False, ToolRisk.WRITE),
    ],
)
def test_classification_follows_the_tool_annotations(
    read_only: bool, destructive: bool, expected: ToolRisk
) -> None:
    assert classify(read_only, destructive) == expected


def test_unannotated_tools_are_treated_as_destructive() -> None:
    """The safe default for an unknown action is to ask.

    A tool added without annotations must not be silently trusted just
    because nobody filled in its hints.
    """
    assert classify(None, None) == ToolRisk.DESTRUCTIVE


@pytest.mark.parametrize(
    "mode,risk,allowed,asks",
    [
        # Read is free everywhere.
        (AgentMode.READ_ONLY, ToolRisk.READ, True, False),
        (AgentMode.MANUAL, ToolRisk.READ, True, False),
        (AgentMode.AUTO, ToolRisk.READ, True, False),
        (AgentMode.FULL, ToolRisk.READ, True, False),
        # Manual asks before anything that changes state.
        (AgentMode.MANUAL, ToolRisk.WRITE, False, True),
        (AgentMode.MANUAL, ToolRisk.DESTRUCTIVE, False, True),
        # Auto creates freely but still asks before destroying.
        (AgentMode.AUTO, ToolRisk.WRITE, True, False),
        (AgentMode.AUTO, ToolRisk.DESTRUCTIVE, False, True),
        # Full asks for nothing.
        (AgentMode.FULL, ToolRisk.WRITE, True, False),
        (AgentMode.FULL, ToolRisk.DESTRUCTIVE, True, False),
    ],
)
def test_mode_matrix(
    mode: AgentMode, risk: ToolRisk, allowed: bool, asks: bool
) -> None:
    decision = evaluate(mode, risk)
    assert decision.allowed is allowed
    assert decision.needs_approval is asks


@pytest.mark.parametrize("risk", [ToolRisk.WRITE, ToolRisk.DESTRUCTIVE])
def test_read_only_refuses_rather_than_asking(risk: ToolRisk) -> None:
    """Read-only means no, not "ask me".

    Prompting would contradict the setting the user chose, so the call is
    refused outright with an explanation.
    """
    decision = evaluate(AgentMode.READ_ONLY, risk)

    assert decision.allowed is False
    assert decision.needs_approval is False
    assert "read only" in decision.reason.lower()


def test_read_only_withholds_write_tools_from_the_model() -> None:
    """Offering a tool and refusing every call wastes tokens and confuses."""
    assert offerable_risks(AgentMode.READ_ONLY) == {ToolRisk.READ}


@pytest.mark.parametrize("mode", [AgentMode.MANUAL, AgentMode.AUTO, AgentMode.FULL])
def test_other_modes_offer_everything(mode: AgentMode) -> None:
    """ "Ask first" only works if the model can propose the action."""
    assert offerable_risks(mode) == {
        ToolRisk.READ,
        ToolRisk.WRITE,
        ToolRisk.DESTRUCTIVE,
    }


def test_modes_never_grant_more_than_a_looser_mode() -> None:
    """Autonomy must increase monotonically across the modes.

    Guards against a future edit that accidentally lets a stricter mode
    permit something a looser one does not.
    """
    order = [AgentMode.READ_ONLY, AgentMode.MANUAL, AgentMode.AUTO, AgentMode.FULL]
    # strict=False on purpose: pairing adjacent modes leaves the last one
    # without a successor.
    for stricter, looser in zip(order, order[1:], strict=False):
        for risk in ToolRisk:
            if evaluate(stricter, risk).allowed:
                assert evaluate(looser, risk).allowed, (
                    f"{stricter.value} allows {risk.value} but {looser.value} does not"
                )


@pytest.mark.parametrize(
    "value,expected",
    [
        ("read_only", AgentMode.READ_ONLY),
        ("full", AgentMode.FULL),
        # Anything unrecognised falls back to the cautious mode.
        ("", AgentMode.MANUAL),
        (None, AgentMode.MANUAL),
        ("root", AgentMode.MANUAL),
        ("FULL", AgentMode.MANUAL),
    ],
)
def test_parse_mode_never_escalates(value: str | None, expected: AgentMode) -> None:
    """A malformed mode must never be read as more autonomy than requested."""
    assert parse_mode(value) == expected
