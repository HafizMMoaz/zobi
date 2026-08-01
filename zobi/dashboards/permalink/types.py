from collections.abc import Sequence
from typing import Any, Optional, TypedDict


class DashboardPermalinkState(TypedDict, total=False):
    dataMask: Optional[dict[str, Any]]
    activeTabs: Optional[list[str]]
    anchor: Optional[str]
    # urlParams items are stored/transmitted as JSON arrays, so they
    # arrive at runtime as ``list[str]``; ``Sequence[str]`` keeps the
    # annotation permissive of both list and tuple shapes.
    urlParams: Optional[list[Sequence[str]]]
    chartStates: Optional[dict[str, Any]]


class DashboardPermalinkValue(TypedDict):
    dashboardId: str
    state: DashboardPermalinkState
