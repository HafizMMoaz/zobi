from flask_appbuilder import permission_name
from flask_appbuilder.api import expose
from flask_appbuilder.security.decorators import has_access

from zobi.zobi_typing import FlaskResponse

from .base import BaseZobiView


class UsersListView(BaseZobiView):
    route_base = "/"
    class_permission_name = "security"

    @expose("/users/")
    @has_access
    @permission_name("read")
    def list(self) -> FlaskResponse:
        return super().render_app_template()
