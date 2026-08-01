import logging
from functools import partial
from typing import Optional

from flask_babel import lazy_gettext as _

from zobi.commands.base import BaseCommand
from zobi.commands.database.exceptions import (
    DatabaseDeleteDatasetsExistFailedError,
    DatabaseDeleteFailedError,
    DatabaseDeleteFailedReportsExistError,
    DatabaseNotFoundError,
)
from zobi.daos.database import DatabaseDAO
from zobi.daos.report import ReportScheduleDAO
from zobi.models.core import Database
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteDatabaseCommand(BaseCommand):
    def __init__(self, model_id: int):
        self._model_id = model_id
        self._model: Optional[Database] = None

    @transaction(on_error=partial(on_error, reraise=DatabaseDeleteFailedError))
    def run(self) -> None:
        self.validate()
        assert self._model
        DatabaseDAO.delete([self._model])

    def validate(self) -> None:
        # Validate/populate model exists
        self._model = DatabaseDAO.find_by_id(self._model_id)
        if not self._model:
            raise DatabaseNotFoundError()
        # Check there are no associated ReportSchedules

        if reports := ReportScheduleDAO.find_by_database_id(self._model_id):
            report_names = [report.name for report in reports]
            raise DatabaseDeleteFailedReportsExistError(
                _(
                    "There are associated alerts or reports: %(report_names)s",
                    report_names=",".join(report_names),
                )
            )
        # Check if there are datasets for this database
        if self._model.tables:
            raise DatabaseDeleteDatasetsExistFailedError()
