import logging
from typing import Any

from flask import Response
from flask_appbuilder.api import expose, protect, rison as parse_rison, safe
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_babel import ngettext

from zobi.commands.css.delete import DeleteCssTemplateCommand
from zobi.commands.css.exceptions import (
    CssTemplateDeleteFailedError,
    CssTemplateNotFoundError,
)
from zobi.constants import MODEL_API_RW_METHOD_PERMISSION_MAP, RouteMethod
from zobi.css_templates.filters import CssTemplateAllTextFilter
from zobi.css_templates.schemas import (
    get_delete_ids_schema,
    openapi_spec_methods_override,
)
from zobi.extensions import event_logger
from zobi.models.core import CssTemplate
from zobi.views.base_api import (
    BaseZobiModelRestApi,
    RelatedFieldFilter,
    statsd_metrics,
)
from zobi.views.filters import BaseFilterRelatedUsers, FilterRelatedOwners

logger = logging.getLogger(__name__)


class CssTemplateRestApi(BaseZobiModelRestApi):
    datamodel = SQLAInterface(CssTemplate)

    include_route_methods = RouteMethod.REST_MODEL_VIEW_CRUD_SET | {
        RouteMethod.RELATED,
        "bulk_delete",  # not using RouteMethod since locally defined
    }
    class_permission_name = "CssTemplate"
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP

    resource_name = "css_template"
    allow_browser_login = True

    show_columns = [
        "changed_on_delta_humanized",
        "changed_by.first_name",
        "changed_by.id",
        "changed_by.last_name",
        "created_by.first_name",
        "created_by.id",
        "created_by.last_name",
        "css",
        "id",
        "template_name",
    ]
    list_columns = [
        "changed_on_delta_humanized",
        "changed_by.first_name",
        "changed_by.id",
        "changed_by.last_name",
        "created_on",
        "created_by.first_name",
        "created_by.id",
        "created_by.last_name",
        "css",
        "id",
        "template_name",
    ]
    add_columns = ["css", "template_name"]
    edit_columns = add_columns
    order_columns = ["template_name"]

    search_filters = {"template_name": [CssTemplateAllTextFilter]}
    allowed_rel_fields = {"created_by", "changed_by"}

    apispec_parameter_schemas = {
        "get_delete_ids_schema": get_delete_ids_schema,
    }
    openapi_spec_tag = "CSS Templates"
    openapi_spec_methods = openapi_spec_methods_override

    related_field_filters = {
        "changed_by": RelatedFieldFilter("first_name", FilterRelatedOwners),
    }
    base_related_field_filters = {
        "changed_by": [["id", BaseFilterRelatedUsers, lambda: []]],
    }

    @expose("/", methods=("DELETE",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.bulk_delete",
        log_to_statsd=False,
    )
    @parse_rison(get_delete_ids_schema)
    def bulk_delete(self, **kwargs: Any) -> Response:
        """Bulk delete CSS templates.
        ---
        delete:
          summary: Bulk delete CSS templates
          parameters:
          - in: query
            name: q
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/get_delete_ids_schema'
          responses:
            200:
              description: CSS templates bulk delete
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      message:
                        type: string
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
            422:
              $ref: '#/components/responses/422'
            500:
              $ref: '#/components/responses/500'
        """
        item_ids = kwargs["rison"]
        try:
            DeleteCssTemplateCommand(item_ids).run()
            return self.response(
                200,
                message=ngettext(
                    "Deleted %(num)d css template",
                    "Deleted %(num)d css templates",
                    num=len(item_ids),
                ),
            )
        except CssTemplateNotFoundError:
            return self.response_404()
        except CssTemplateDeleteFailedError as ex:
            return self.response_422(message=str(ex))
