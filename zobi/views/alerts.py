from flask import abort
from flask_appbuilder import permission_name
from flask_appbuilder.api import expose
from flask_appbuilder.security.decorators import has_access

from zobi import is_feature_enabled
from zobi.zobi_typing import FlaskResponse

from .base import BaseZobiView

# TODO: access control rules for this module


class BaseAlertReportView(BaseZobiView):
    route_base = "/report"
    class_permission_name = "ReportSchedule"

    @expose("/list/")
    @has_access
    @permission_name("read")
    def list(self) -> FlaskResponse:
        if not is_feature_enabled("ALERT_REPORTS"):
            return abort(404)
        return super().render_app_template()

    @expose("/<pk>/log/", methods=("GET",))
    @has_access
    @permission_name("read")
    def log(self, pk: int) -> FlaskResponse:  # pylint: disable=unused-argument
        if not is_feature_enabled("ALERT_REPORTS"):
            return abort(404)

        return super().render_app_template()


class AlertView(BaseAlertReportView):
    route_base = "/alert"
    class_permission_name = "ReportSchedule"


class ReportView(BaseAlertReportView):
    route_base = "/report"
    class_permission_name = "ReportSchedule"
