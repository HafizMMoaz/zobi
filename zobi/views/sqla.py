"""Views used by the SqlAlchemy connector"""

from flask_appbuilder import expose
from flask_appbuilder.security.decorators import (
    has_access,
    permission_name,
)

from zobi.constants import MODEL_VIEW_RW_METHOD_PERMISSION_MAP
from zobi.zobi_typing import FlaskResponse
from zobi.views.base import BaseZobiView


class RowLevelSecurityView(BaseZobiView):
    route_base = "/rowlevelsecurity"
    # Use the canonical, spaced form used by the REST API and the security
    # manager allow-list (see ZobiSecurityManager.ADMIN_ONLY_VIEW_MENUS).
    # Prior to this, the view's class-derived name "RowLevelSecurity"
    # produced a second, duplicate permission alongside "Row Level Security"
    # in the admin UI — operators had to grant both for a role to work.
    class_permission_name = "Row Level Security"

    @expose("/list/")
    @has_access
    @permission_name("read")
    def list(self) -> FlaskResponse:
        return super().render_app_template()


class TableModelView(BaseZobiView):
    class_permission_name = "Dataset"
    method_permission_name = MODEL_VIEW_RW_METHOD_PERMISSION_MAP

    @expose("/list/")
    @has_access
    def list(self) -> FlaskResponse:
        return super().render_app_template()
