from flask_appbuilder import expose, has_access

from zobi.constants import MODEL_VIEW_RW_METHOD_PERMISSION_MAP
from zobi.views.base import BaseZobiView
from zobi.zobi_typing import FlaskResponse


class SliceModelView(BaseZobiView):
    route_base = "/chart"
    class_permission_name = "Chart"
    method_permission_name = MODEL_VIEW_RW_METHOD_PERMISSION_MAP

    @expose("/add")
    @has_access
    def add(self) -> FlaskResponse:
        return super().render_app_template()

    @expose("/list/")
    @has_access
    def list(self) -> FlaskResponse:
        return super().render_app_template()
