import logging

from flask_appbuilder import expose
from flask_appbuilder.hooks import before_request
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.decorators import has_access, has_access_api
from werkzeug.exceptions import NotFound

from zobi import db, is_feature_enabled
from zobi.tags.models import Tag
from zobi.utils import json
from zobi.views.base import ZobiModelView
from zobi.zobi_typing import FlaskResponse

from .base import BaseZobiView, json_success

logger = logging.getLogger(__name__)


class TagModelView(ZobiModelView):
    route_base = "/zobi/tags"
    datamodel = SQLAInterface(Tag)
    class_permission_name = "Tags"
    include_route_methods = {"list"}

    @has_access
    @expose("/")
    def list(self) -> FlaskResponse:
        if not is_feature_enabled("TAGGING_SYSTEM"):
            return super().list()

        return super().render_app_template()


class TagView(BaseZobiView):
    @staticmethod
    def is_enabled() -> bool:
        return is_feature_enabled("TAGGING_SYSTEM")

    @before_request
    def ensure_enabled(self) -> None:
        if not self.is_enabled():
            raise NotFound()

    @has_access_api
    @expose("/tags/", methods=("GET",))
    def tags(self) -> FlaskResponse:
        query = db.session.query(Tag).all()
        results = [
            {
                "id": obj.id,
                "type": obj.type.name,
                "name": obj.name,
                "changed_on": obj.changed_on,
                "changed_by": obj.changed_by_fk,
                "created_by": obj.created_by_fk,
            }
            for obj in query
        ]
        return json_success(json.dumps(results, default=json.json_int_dttm_ser))
