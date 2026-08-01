from typing import Any

from flask_babel import lazy_gettext as _
from sqlalchemy import or_
from sqlalchemy.orm.query import Query

from zobi import db, security_manager
from zobi.reports.models import ReportSchedule
from zobi.views.base import BaseFilter


class ReportScheduleFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    def apply(self, query: Query, value: Any) -> Query:
        if security_manager.can_access_all_datasources():
            return query
        owner_ids_query = (
            db.session.query(ReportSchedule.id)
            .join(ReportSchedule.owners)
            .filter(
                security_manager.user_model.id
                == security_manager.user_model.get_user_id()
            )
        )
        return query.filter(ReportSchedule.id.in_(owner_ids_query))


class ReportScheduleAllTextFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    name = _("All Text")
    arg_name = "report_all_text"

    def apply(self, query: Query, value: Any) -> Query:
        if not value:
            return query
        ilike_value = f"%{value}%"
        return query.filter(
            or_(
                ReportSchedule.name.ilike(ilike_value),
                ReportSchedule.description.ilike(ilike_value),
                ReportSchedule.sql.ilike(ilike_value),
            )
        )
