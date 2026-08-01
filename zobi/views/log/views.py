from flask import current_app as app
from flask_appbuilder.hooks import before_request
from flask_appbuilder.models.sqla.interface import SQLAInterface
from werkzeug.exceptions import NotFound

import zobi.models.core as models
from zobi.constants import MODEL_VIEW_RW_METHOD_PERMISSION_MAP, RouteMethod
from zobi.views.base import ZobiModelView

from . import LogMixin


class LogModelView(  # pylint: disable=too-many-ancestors
    LogMixin,
    ZobiModelView,
):
    datamodel = SQLAInterface(models.Log)
    include_route_methods = {RouteMethod.LIST, RouteMethod.SHOW}
    class_permission_name = "Log"
    method_permission_name = MODEL_VIEW_RW_METHOD_PERMISSION_MAP

    @staticmethod
    def is_enabled() -> bool:
        return app.config["FAB_ADD_SECURITY_VIEWS"] and app.config["ZOBI_LOG_VIEW"]

    @before_request
    def ensure_enabled(self) -> None:
        if not self.is_enabled():
            raise NotFound()
