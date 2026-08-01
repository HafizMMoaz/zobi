import logging
from functools import partial

from zobi.commands.base import BaseCommand
from zobi.commands.dashboard.exceptions import (
    DashboardUnfaveError,
)
from zobi.daos.dashboard import DashboardDAO
from zobi.models.dashboard import Dashboard
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DelFavoriteDashboardCommand(BaseCommand):
    def __init__(self, dashboard_id: int) -> None:
        self._dashboard_id = dashboard_id
        self._dashboard: Dashboard | None = None

    @transaction(on_error=partial(on_error, reraise=DashboardUnfaveError))
    def run(self) -> None:
        self.validate()
        if self._dashboard:
            return DashboardDAO.remove_favorite(self._dashboard)

    def validate(self) -> None:
        # Raises DashboardNotFoundError or DashboardAccessDeniedError
        dashboard = DashboardDAO.get_by_id_or_slug(self._dashboard_id)
        self._dashboard = dashboard
