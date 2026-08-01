import logging

from flask import current_app as app, Response
from flask_appbuilder.api import expose, protect, safe

from zobi.available_domains.schemas import AvailableDomainsSchema
from zobi.constants import MODEL_API_RW_METHOD_PERMISSION_MAP
from zobi.extensions import event_logger
from zobi.views.base_api import BaseZobiApi, statsd_metrics

logger = logging.getLogger(__name__)


class AvailableDomainsRestApi(BaseZobiApi):
    available_domains_schema = AvailableDomainsSchema()

    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    allow_browser_login = True
    class_permission_name = "AvailableDomains"
    resource_name = "available_domains"
    openapi_spec_tag = "Available Domains"
    openapi_spec_component_schemas = (AvailableDomainsSchema,)

    @expose("/", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.get",
        log_to_statsd=True,
    )
    def get(self) -> Response:
        """
        Get the list of available Zobi Webserver domains (if any)
        defined in config. This enables charts embedded in other apps to
        leverage domain sharding if appropriately configured.
        ---
        get:
          summary: Get all available domains
          responses:
            200:
              description: a list of available domains
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      result:
                        $ref: '#/components/schemas/AvailableDomainsSchema'
            401:
              $ref: '#/components/responses/401'
            403:
              $ref: '#/components/responses/403'
        """
        result = self.available_domains_schema.dump(
            {"domains": app.config.get("ZOBI_WEBSERVER_DOMAINS")}
        )
        return self.response(200, result=result)
