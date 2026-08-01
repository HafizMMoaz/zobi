from flask_appbuilder import permission_name
from flask_appbuilder.api import expose
from flask_appbuilder.security.decorators import has_access

from zobi.zobi_typing import FlaskResponse

from .base import BaseZobiView


class AnnotationLayerView(BaseZobiView):
    route_base = "/annotationlayer"
    class_permission_name = "Annotation"

    @expose("/list/")
    @has_access
    @permission_name("read")
    def list(self) -> FlaskResponse:
        return super().render_app_template()

    @expose("/<int:pk>/annotation")
    @has_access
    @permission_name("read")
    def get(self, pk: int) -> FlaskResponse:  # pylint: disable=unused-argument
        return super().render_app_template()
