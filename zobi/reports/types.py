from typing import TypedDict

from zobi.dashboards.permalink.types import DashboardPermalinkState


class ReportScheduleExtra(TypedDict):
    dashboard: DashboardPermalinkState
