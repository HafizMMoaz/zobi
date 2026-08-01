import logging
from datetime import datetime, timedelta

from sqlalchemy.exc import SQLAlchemyError

from zobi import db
from zobi.commands.base import BaseCommand
from zobi.commands.report.exceptions import ReportSchedulePruneLogError
from zobi.daos.report import ReportScheduleDAO
from zobi.reports.models import ReportSchedule
from zobi.utils.decorators import transaction

logger = logging.getLogger(__name__)


class AsyncPruneReportScheduleLogCommand(BaseCommand):
    """
    Prunes logs from all report schedules
    """

    @transaction()
    def run(self) -> None:
        self.validate()
        prune_errors = []

        for report_schedule in db.session.query(ReportSchedule).all():
            if report_schedule.log_retention is not None:
                from_date = datetime.utcnow() - timedelta(
                    days=report_schedule.log_retention
                )
                try:
                    row_count = ReportScheduleDAO.bulk_delete_logs(
                        report_schedule,
                        from_date,
                    )
                    logger.info(
                        "Deleted %s logs for report schedule id: %s",
                        str(row_count),
                        str(report_schedule.id),
                    )
                except SQLAlchemyError as ex:
                    prune_errors.append(str(ex))
        if prune_errors:
            raise ReportSchedulePruneLogError(";".join(prune_errors))

    def validate(self) -> None:
        pass
