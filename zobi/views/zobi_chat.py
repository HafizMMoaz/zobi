from flask_appbuilder.api import expose
from flask_appbuilder.security.decorators import has_access

from zobi.views.base import BaseZobiView
from zobi.zobi_typing import FlaskResponse


class ZobiChatView(BaseZobiView):
    """Serves the dedicated Zobi chat page.

    The page itself is React (``frontend/src/pages/ZobiChat``) talking to
    ``/api/v1/zobi_agent``; this view exists so the route is permission
    guarded and appears in the menu.
    """

    route_base = "/zobi"
    class_permission_name = "ZobiAgent"
    # Named for what it serves rather than reusing RouteMethod.LIST, which
    # only exposes a method literally called `list`.
    include_route_methods = {"chat"}

    @expose("/chat/")
    @has_access
    def chat(self) -> FlaskResponse:
        return super().render_app_template()
