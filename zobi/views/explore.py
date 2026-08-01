from flask_appbuilder import permission_name
from flask_appbuilder.api import expose
from flask_appbuilder.security.decorators import has_access

from zobi import event_logger
from zobi.zobi_typing import FlaskResponse

from .base import BaseZobiView


class ExploreView(BaseZobiView):
    route_base = "/explore"
    class_permission_name = "Explore"

    @expose("/")
    @has_access
    @permission_name("read")
    @event_logger.log_this
    def root(self) -> FlaskResponse:
        return super().render_app_template()


class ExplorePermalinkView(BaseZobiView):
    route_base = "/zobi"
    class_permission_name = "Explore"

    @expose("/explore/p/<key>/")
    @has_access
    @permission_name("read")
    @event_logger.log_this
    # pylint: disable=unused-argument
    def permalink(self, key: str) -> FlaskResponse:
        return super().render_app_template()
