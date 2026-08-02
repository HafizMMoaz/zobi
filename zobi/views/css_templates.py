from flask_appbuilder.api import expose
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.decorators import has_access

from zobi.constants import MODEL_VIEW_RW_METHOD_PERMISSION_MAP, RouteMethod
from zobi.models import core as models
from zobi.views.base import DeleteMixin, ZobiModelView
from zobi.zobi_typing import FlaskResponse


class CssTemplateModelView(  # pylint: disable=too-many-ancestors
    ZobiModelView,
    DeleteMixin,
):
    datamodel = SQLAInterface(models.CssTemplate)
    include_route_methods = RouteMethod.LIST

    class_permission_name = "CssTemplate"
    method_permission_name = MODEL_VIEW_RW_METHOD_PERMISSION_MAP

    @expose("/list/")
    @has_access
    def list(self) -> FlaskResponse:
        return super().render_app_template()
