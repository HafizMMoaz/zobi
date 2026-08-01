import logging
from functools import partial
from typing import Any

from zobi import is_feature_enabled, security_manager
from zobi.commands.base import BaseCommand
from zobi.commands.dashboard.exceptions import (
    DashboardCopyError,
    DashboardForbiddenError,
    DashboardInvalidError,
)
from zobi.daos.dashboard import DashboardDAO
from zobi.models.dashboard import Dashboard
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class CopyDashboardCommand(BaseCommand):
    def __init__(self, original_dash: Dashboard, data: dict[str, Any]) -> None:
        self._original_dash = original_dash
        self._properties = data.copy()

    @transaction(on_error=partial(on_error, reraise=DashboardCopyError))
    def run(self) -> Dashboard:
        self.validate()
        return DashboardDAO.copy_dashboard(self._original_dash, self._properties)

    def validate(self) -> None:
        if not self._properties.get("dashboard_title") or not self._properties.get(
            "json_metadata"
        ):
            raise DashboardInvalidError()
        if is_feature_enabled("DASHBOARD_RBAC") and not security_manager.is_owner(
            self._original_dash
        ):
            raise DashboardForbiddenError()
