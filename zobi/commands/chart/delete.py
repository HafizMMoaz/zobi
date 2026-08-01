import logging
from functools import partial
from typing import Optional

from flask_babel import lazy_gettext as _

from zobi import security_manager
from zobi.commands.base import BaseCommand
from zobi.commands.chart.exceptions import (
    ChartDeleteFailedError,
    ChartDeleteFailedReportsExistError,
    ChartForbiddenError,
    ChartNotFoundError,
)
from zobi.daos.chart import ChartDAO
from zobi.daos.report import ReportScheduleDAO
from zobi.exceptions import ZobiSecurityException
from zobi.models.slice import Slice
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteChartCommand(BaseCommand):
    def __init__(self, model_ids: list[int]):
        self._model_ids = model_ids
        self._models: Optional[list[Slice]] = None

    @transaction(on_error=partial(on_error, reraise=ChartDeleteFailedError))
    def run(self) -> None:
        self.validate()
        assert self._models
        ChartDAO.delete(self._models)

    def validate(self) -> None:
        # Validate/populate model exists
        self._models = ChartDAO.find_by_ids(self._model_ids)
        if not self._models or len(self._models) != len(self._model_ids):
            raise ChartNotFoundError()
        # Check there are no associated ReportSchedules
        if reports := ReportScheduleDAO.find_by_chart_ids(self._model_ids):
            report_names = [report.name for report in reports]
            raise ChartDeleteFailedReportsExistError(
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
                raise ChartForbiddenError() from ex
