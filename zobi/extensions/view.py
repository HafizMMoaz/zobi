from flask_appbuilder import expose
from flask_appbuilder.security.decorators import has_access, permission_name

from zobi.constants import MODEL_VIEW_RW_METHOD_PERMISSION_MAP
from zobi.views.base import BaseZobiView
from zobi.zobi_typing import FlaskResponse


class ExtensionsView(BaseZobiView):
    route_base = "/extensions"
    class_permission_name = "Extensions"
    method_permission_name = MODEL_VIEW_RW_METHOD_PERMISSION_MAP

    @expose("/list/")
    @has_access
    @permission_name("read")
    def list(self) -> FlaskResponse:
        return super().render_app_template()
