import logging
from typing import Optional

from flask import Response
from flask_appbuilder.api import expose, protect, safe
from flask_appbuilder.hooks import before_request
from flask_appbuilder.models.sqla.interface import SQLAInterface

from zobi import is_feature_enabled
from zobi.commands.dashboard.embedded.exceptions import (
    EmbeddedDashboardNotFoundError,
)
from zobi.constants import MODEL_API_RW_METHOD_PERMISSION_MAP, RouteMethod
from zobi.daos.dashboard import EmbeddedDashboardDAO
from zobi.dashboards.schemas import EmbeddedDashboardResponseSchema
from zobi.extensions import event_logger
from zobi.models.embedded_dashboard import EmbeddedDashboard
from zobi.reports.logs.schemas import openapi_spec_methods_override
from zobi.views.base_api import BaseZobiModelRestApi, statsd_metrics

logger = logging.getLogger(__name__)


class EmbeddedDashboardRestApi(BaseZobiModelRestApi):
    datamodel = SQLAInterface(EmbeddedDashboard)

    @before_request
    def ensure_embedded_enabled(self) -> Optional[Response]:
        if not is_feature_enabled("EMBEDDED_ZOBI"):
            return self.response_404()
        return None

    include_route_methods = RouteMethod.GET
    class_permission_name = "EmbeddedDashboard"
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP

    resource_name = "embedded_dashboard"
    allow_browser_login = True

    openapi_spec_tag = "Embedded Dashboard"
    openapi_spec_methods = openapi_spec_methods_override

    embedded_response_schema = EmbeddedDashboardResponseSchema()

    @expose("/<uuid>", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.get_embedded",
        log_to_statsd=False,
    )
    # pylint: disable=arguments-differ, arguments-renamed)
    def get(self, uuid: str) -> Response:
        """Get the dashboard's embedded configuration.
        ---
        get:
          summary: >-
            Get the dashboard's embedded configuration this endpoint is also used
            to embed dashboards.
          parameters:
          - in: path
            schema:
              type: string
            name: uuid
            description: The embedded configuration uuid
          - in: query
            schema:
              type: number
            name: uiConfig
            description: The ui config of embedded dashboard (optional).
          - in: query
            schema:
              type: boolean
            name: show_filters
            description: Show filters (optional).
          - in: query
            schema:
              type: boolean
            name: expand_filters
            description: Expand filters (optional).
          - in: query
            schema:
              type: string
            name: native_filters_key
            description: Native filters key to apply filters. (optional).
          - in: query
            schema:
              type: string
            name: permalink_key
            description: Permalink key to apply filters. (optional).
          responses:
            200:
              description: Result contains the embedded dashboard configuration
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      result:
                        $ref: '#/components/schemas/EmbeddedDashboardResponseSchema'
                text/html:
                    schema:
                        type: string
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
            500:
              $ref: '#/components/responses/500'
        """
        try:
            embedded = EmbeddedDashboardDAO.find_by_id(uuid)
            if not embedded:
                raise EmbeddedDashboardNotFoundError()
            result = self.embedded_response_schema.dump(embedded)
            return self.response(200, result=result)
        except EmbeddedDashboardNotFoundError:
            return self.response_404()
