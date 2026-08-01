import logging

from flask import request, Response
from flask_appbuilder.api import expose, protect, safe

from zobi.commands.chart.exceptions import ChartNotFoundError
from zobi.commands.explore.get import GetExploreCommand
from zobi.commands.explore.parameters import CommandParameters
from zobi.commands.temporary_cache.exceptions import (
    TemporaryCacheAccessDeniedError,
    TemporaryCacheResourceNotFoundError,
)
from zobi.constants import MODEL_API_RW_METHOD_PERMISSION_MAP
from zobi.exceptions import ZobiSecurityException
from zobi.explore.exceptions import DatasetAccessDeniedError, WrongEndpointError
from zobi.explore.permalink.exceptions import ExplorePermalinkGetFailedError
from zobi.explore.schemas import ExploreContextSchema
from zobi.extensions import event_logger
from zobi.views.base_api import BaseZobiApi, statsd_metrics

logger = logging.getLogger(__name__)


class ExploreRestApi(BaseZobiApi):
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    allow_browser_login = True
    class_permission_name = "Explore"
    resource_name = "explore"
    openapi_spec_tag = "Explore"
    openapi_spec_component_schemas = (ExploreContextSchema,)

    @expose("/", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.get",
        log_to_statsd=True,
    )
    def get(self) -> Response:
        """Assemble Explore related information (form_data, slice, dataset)
        in a single endpoint.
        ---
        get:
          summary: Assemble Explore related information in a single endpoint
          description: >-
            Assembles Explore related information (form_data, slice, dataset) in a
            single endpoint.<br/><br/>
            The information can be assembled from:<br/>
            - The cache using a form_data_key<br/>
            - The metadata database using a permalink_key<br/>
            - Build from scratch using dataset or slice identifiers.
          parameters:
          - in: query
            schema:
              type: string
            name: form_data_key
          - in: query
            schema:
              type: string
            name: permalink_key
          - in: query
            schema:
              type: integer
            name: slice_id
          - in: query
            schema:
              type: integer
            name: datasource_id
          - in: query
            schema:
              type: string
            name: datasource_type
          responses:
            200:
              description: Returns the initial context.
              content:
                application/json:
                  schema:
                    $ref: '#/components/schemas/ExploreContextSchema'
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
            422:
              $ref: '#/components/responses/422'
            500:
              $ref: '#/components/responses/500'
        """
        try:
            params = CommandParameters(
                permalink_key=request.args.get("permalink_key", type=str),
                form_data_key=request.args.get("form_data_key", type=str),
                datasource_id=request.args.get("datasource_id", type=int),
                datasource_type=request.args.get("datasource_type", type=str),
                slice_id=request.args.get("slice_id", type=int),
            )
            result = GetExploreCommand(params).run()
            if not result:
                return self.response_404()
            return self.response(200, result=result)
        except ValueError as ex:
            return self.response(400, message=str(ex))
        except ZobiSecurityException as ex:
            return self.response(
                403,
                **ex.to_dict(),
            )
        except DatasetAccessDeniedError as ex:
            return self.response(
                403,
                message=ex.message,
                datasource_id=ex.datasource_id,
                datasource_type=ex.datasource_type,
            )
        except (ChartNotFoundError, ExplorePermalinkGetFailedError) as ex:
            return self.response(404, message=str(ex))
        except WrongEndpointError as ex:
            return self.response(302, redirect=ex.redirect)
        except TemporaryCacheAccessDeniedError as ex:
            return self.response(403, message=str(ex))
        except TemporaryCacheResourceNotFoundError as ex:
            return self.response(404, message=str(ex))
