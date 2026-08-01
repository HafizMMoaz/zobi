
import logging

from flask_appbuilder import expose
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.decorators import has_access

from zobi import is_feature_enabled
from zobi.constants import RouteMethod
from zobi.zobi_typing import FlaskResponse
from zobi.tags.models import Tag
from zobi.views.base import ZobiModelView

logger = logging.getLogger(__name__)


class TaggedObjectsModelView(ZobiModelView):
    route_base = "/zobi/all_entities"
    datamodel = SQLAInterface(Tag)
    class_permission_name = "Tags"
    include_route_methods = {RouteMethod.LIST}

    @has_access
    @expose("/")
    def list(self) -> FlaskResponse:
        if not is_feature_enabled("TAGGING_SYSTEM"):
            return super().list()

        return super().render_app_template()
