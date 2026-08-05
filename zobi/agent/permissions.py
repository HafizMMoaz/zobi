"""Decides which tool calls the agent may make without asking first.

This is a *second* gate, not the only one. Every tool runs through the MCP
layer under the requesting user's identity, so Zobi's normal RBAC already
bounds what is reachable. What this module adds is intent: a user with full
write permissions still usually wants to be asked before something is created,
changed or deleted on their behalf.

The read/write/destructive classification is not maintained here. Each MCP tool
declares ``readOnlyHint`` and ``destructiveHint`` in its own annotations, so a
newly added tool is classified by whoever wrote it rather than by a list in
this file that would silently fall out of date. A tool that declares nothing is
treated as destructive, because the safe default for an unknown action is to
ask.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from flask_babel import lazy_gettext as _


class ToolRisk(str, Enum):
    """How much damage a tool can do, derived from its MCP annotations."""

    #: Reads only. Listing dashboards, querying a dataset, fetching a schema.
    READ = "read"
    #: Creates something new. Generating a chart, saving a query.
    WRITE = "write"
    #: Changes or removes something that already exists.
    DESTRUCTIVE = "destructive"


class AgentMode(str, Enum):
    """How much autonomy the user has granted for this conversation."""

    #: Only reads. Write tools are not even offered to the model, so it cannot
    #: propose them and then be refused.
    READ_ONLY = "read_only"
    #: Reads run freely; anything that writes stops and asks. The default.
    MANUAL = "manual"
    #: Reads and writes run unattended; destructive calls still ask.
    AUTO = "auto"
    #: Everything runs unattended, including destructive calls.
    FULL = "full"


#: What each mode allows without asking. Modes are deliberately cumulative, so
#: a stricter mode can never permit more than a looser one.
_UNATTENDED: dict[AgentMode, set[ToolRisk]] = {
    AgentMode.READ_ONLY: {ToolRisk.READ},
    AgentMode.MANUAL: {ToolRisk.READ},
    AgentMode.AUTO: {ToolRisk.READ, ToolRisk.WRITE},
    AgentMode.FULL: {ToolRisk.READ, ToolRisk.WRITE, ToolRisk.DESTRUCTIVE},
}

MODE_LABELS: dict[AgentMode, str] = {
    AgentMode.READ_ONLY: str(_("Read only")),
    AgentMode.MANUAL: str(_("Ask before changes")),
    AgentMode.AUTO: str(_("Auto")),
    AgentMode.FULL: str(_("Full access")),
}

MODE_DESCRIPTIONS: dict[AgentMode, str] = {
    AgentMode.READ_ONLY: str(
        _("Zobi can look at your data but cannot change anything.")
    ),
    AgentMode.MANUAL: str(
        _("Zobi asks before creating, changing or deleting anything.")
    ),
    AgentMode.AUTO: str(
        _("Zobi creates things on its own, but asks before changing or deleting.")
    ),
    AgentMode.FULL: str(
        _("Zobi acts without asking, including changing and deleting.")
    ),
}


def classify(read_only_hint: bool | None, destructive_hint: bool | None) -> ToolRisk:
    """Map a tool's MCP annotations onto a risk level.

    ``readOnlyHint`` wins when set: a tool that cannot write cannot destroy,
    whatever else it claims. Absent annotations fall through to DESTRUCTIVE so
    that an unannotated tool is gated rather than quietly trusted.
    """
    if read_only_hint:
        return ToolRisk.READ
    if destructive_hint:
        return ToolRisk.DESTRUCTIVE
    if read_only_hint is None and destructive_hint is None:
        return ToolRisk.DESTRUCTIVE
    return ToolRisk.WRITE


@dataclass(frozen=True)
class Decision:
    """The outcome of checking one proposed tool call against a mode."""

    allowed: bool
    #: True when the user should be asked. Never set together with ``allowed``.
    needs_approval: bool
    reason: str = ""


def evaluate(mode: AgentMode, risk: ToolRisk) -> Decision:
    """Decide whether a call of this risk may proceed unattended."""
    if risk in _UNATTENDED[mode]:
        return Decision(allowed=True, needs_approval=False)

    if mode is AgentMode.READ_ONLY:
        # Refused outright rather than queued for approval: the user chose a
        # mode that says no, so asking would contradict the setting.
        return Decision(
            allowed=False,
            needs_approval=False,
            reason=str(
                _(
                    "This conversation is read only, so Zobi cannot run "
                    "actions that change anything. Switch modes to allow it."
                )
            ),
        )

    return Decision(allowed=False, needs_approval=True)


def offerable_risks(mode: AgentMode) -> set[ToolRisk]:
    """Which tools should be advertised to the model at all.

    In read-only mode, write tools are withheld entirely. Offering a tool and
    then refusing every call wastes tokens and produces a conversation where
    the agent keeps proposing things that cannot happen.

    Every other mode sees the full set, because "ask first" only works if the
    model can propose the action in the first place.
    """
    if mode is AgentMode.READ_ONLY:
        return {ToolRisk.READ}
    return {ToolRisk.READ, ToolRisk.WRITE, ToolRisk.DESTRUCTIVE}


def parse_mode(value: str | None) -> AgentMode:
    """Read a mode from user input, defaulting to the cautious one.

    An unrecognised value becomes MANUAL rather than raising: a malformed mode
    must never be interpreted as more autonomy than was asked for.
    """
    if not value:
        return AgentMode.MANUAL
    try:
        return AgentMode(value)
    except ValueError:
        return AgentMode.MANUAL
