import logging
from functools import partial
from typing import Optional

from flask_babel import lazy_gettext as _

from zobi import security_manager
from zobi.commands.base import BaseCommand
from zobi.commands.dashboard.exceptions import (
    DashboardDeleteEmbeddedFailedError,
    DashboardDeleteFailedError,
    DashboardDeleteFailedReportsExistError,
    DashboardForbiddenError,
    DashboardNotFoundError,
)
from zobi.daos.dashboard import DashboardDAO, EmbeddedDashboardDAO
from zobi.daos.report import ReportScheduleDAO
from zobi.exceptions import ZobiSecurityException
from zobi.models.dashboard import Dashboard
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteEmbeddedDashboardCommand(BaseCommand):
    def __init__(self, dashboard: Dashboard):
        self._dashboard = dashboard

    @transaction(on_error=partial(on_error, reraise=DashboardDeleteEmbeddedFailedError))
    def run(self) -> None:
        self.validate()
        return EmbeddedDashboardDAO.delete(self._dashboard.embedded)

    def validate(self) -> None:
        pass


class DeleteDashboardCommand(BaseCommand):
    def __init__(self, model_ids: list[int]):
        self._model_ids = model_ids
        self._models: Optional[list[Dashboard]] = None

    @transaction(on_error=partial(on_error, reraise=DashboardDeleteFailedError))
    def run(self) -> None:
        self.validate()
        assert self._models
        DashboardDAO.delete(self._models)

    def validate(self) -> None:
        # Validate/populate model exists
        self._models = DashboardDAO.find_by_ids(self._model_ids)
        if not self._models or len(self._models) != len(self._model_ids):
            raise DashboardNotFoundError()
        # Check there are no associated ReportSchedules
        if reports := ReportScheduleDAO.find_by_dashboard_ids(self._model_ids):
            report_names = [report.name for report in reports]
            raise DashboardDeleteFailedReportsExistError(
                _(
                    "There are associated alerts or reports: %(report_names)s",
                    report_names=",".join(report_names),
                )
            )
        # Check ownership
        for model in self._models:
            try:
                security_manager.raise_for_ownership(model)
            except ZobiSecurityException as ex:
                raise DashboardForbiddenError() from ex
