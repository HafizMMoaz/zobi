from flask_appbuilder.api import expose
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.decorators import has_access

from zobi.constants import MODEL_VIEW_RW_METHOD_PERMISSION_MAP, RouteMethod
from zobi.models.llm import LLMProvider
from zobi.views.base import ZobiModelView
from zobi.zobi_typing import FlaskResponse


class LLMProviderModelView(ZobiModelView):  # pylint: disable=too-many-ancestors
    """Serves the Manage > AI Models shell.

    The page itself is React (``frontend/src/pages/LLMProviderList``) talking to
    the REST APIs; this view exists so the route is permission-guarded and
    appears in the FAB menu. Deletion is handled through the API, so unlike
    ThemeModelView this does not mix in DeleteMixin.
    """

    route_base = "/llm"
    datamodel = SQLAInterface(LLMProvider)
    include_route_methods = RouteMethod.LIST

    class_permission_name = "LLMProvider"
    method_permission_name = MODEL_VIEW_RW_METHOD_PERMISSION_MAP

    @expose("/list/")
    @has_access
    def list(self) -> FlaskResponse:
        return super().render_app_template()
