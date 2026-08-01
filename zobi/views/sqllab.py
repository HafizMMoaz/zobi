import contextlib
from typing import Any

from flask import request
from flask_appbuilder import permission_name
from flask_appbuilder.api import expose
from flask_appbuilder.security.decorators import has_access

from zobi import event_logger
from zobi.constants import MODEL_API_RW_METHOD_PERMISSION_MAP
from zobi.zobi_typing import FlaskResponse
from zobi.utils import json

from .base import BaseZobiView


class SqllabView(BaseZobiView):
    route_base = "/sqllab"
    class_permission_name = "SQLLab"

    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP

    @expose("/", methods=["GET", "POST"])
    @has_access
    @permission_name("read")
    @event_logger.log_this
    def root(self, **kwargs: Any) -> FlaskResponse:
        """Handles the default SQL Lab page."""
        payload = {}
        if form_data := request.form.get("form_data"):
            with contextlib.suppress(json.JSONDecodeError):
                payload["requested_query"] = json.loads(form_data)
        return self.render_app_template(payload)

    @expose("/p/<string:permalink>/", methods=["GET"])
    @has_access
    @permission_name("read")
    @event_logger.log_this
    def permalink_view(self, permalink: str, **kwargs: Any) -> FlaskResponse:
        """Handles permalinks for SQL Lab."""
        return self.root(permalink=permalink, **kwargs)

    @expose("/history/", methods=("GET",))
    @has_access
    @permission_name("read")
    @event_logger.log_this
    def history(self) -> FlaskResponse:
        return self.render_app_template()
