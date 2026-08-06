"""Tools the agent has that the MCP server does not expose.

Almost everything Zobi's agent can do comes from ``zobi/mcp_service``. This
module is for the few capabilities that only make sense inside a conversation,
where the tool needs access to something the MCP server has no concept of, such
as a file the user attached to this chat.

Registering here rather than adding to the MCP server is deliberate. MCP tools
are a public integration surface consumed by external clients; a tool whose
arguments reference a chat attachment id would be meaningless to them.

Each tool declares its own risk, using the same vocabulary as the MCP
annotations so ``permissions`` treats both sources identically.
"""

from __future__ import annotations

import logging
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from zobi.agent.permissions import ToolRisk

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class NativeTool:
    """A tool implemented in-process rather than over MCP."""

    name: str
    title: str
    description: str
    parameters: dict[str, Any]
    risk: ToolRisk
    handler: Callable[..., str]


_REGISTRY: dict[str, NativeTool] = {}


def register(tool: NativeTool) -> NativeTool:
    """Add a tool to the registry, refusing to shadow an existing name.

    A silent overwrite would mean two tools with one name, where which one
    runs depends on import order. Better to fail at import time.
    """
    if tool.name in _REGISTRY:
        raise ValueError(f"Native tool '{tool.name}' is already registered")
    _REGISTRY[tool.name] = tool
    return tool


def registry() -> dict[str, NativeTool]:
    """Every registered native tool, keyed by name.

    Modules defining tools call ``register`` at import time, so each one has to
    be imported here before the registry is read. None exist yet, which is why
    there is nothing to import: the registry is empty until the first is added.
    """
    return dict(_REGISTRY)


def get(name: str) -> NativeTool | None:
    return registry().get(name)


def run(name: str, arguments: dict[str, Any]) -> tuple[bool, str]:
    """Execute a native tool, converting failures into text for the model.

    Mirrors the contract of ``zobi.agent.tools.call_tool`` so the runtime can
    treat both sources the same way: the model recovers better from a readable
    error than from an abandoned turn.
    """
    tool = get(name)
    if tool is None:
        return False, f"'{name}' is not a known tool."

    try:
        return True, tool.handler(**arguments)
    except TypeError as ex:
        # Almost always the model supplying wrong or missing arguments.
        return False, f"'{name}' was called with invalid arguments: {ex}"
    except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
        logger.warning("Native tool %s failed: %s", name, type(ex).__name__)
        return False, f"'{name}' failed: {ex}"
