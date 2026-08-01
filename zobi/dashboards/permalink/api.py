import logging

from flask import request, Response, url_for
from flask_appbuilder.api import expose, protect, safe
from marshmallow import ValidationError

from zobi.commands.dashboard.exceptions import (
    DashboardAccessDeniedError,
    DashboardNotFoundError,
)
from zobi.commands.dashboard.permalink.create import CreateDashboardPermalinkCommand
from zobi.commands.dashboard.permalink.get import GetDashboardPermalinkCommand
from zobi.constants import MODEL_API_RW_METHOD_PERMISSION_MAP
from zobi.dashboards.permalink.exceptions import DashboardPermalinkInvalidStateError
from zobi.dashboards.permalink.schemas import DashboardPermalinkStateSchema
from zobi.extensions import event_logger
from zobi.key_value.exceptions import KeyValueAccessDeniedError
from zobi.views.base_api import BaseZobiApi, requires_json

logger = logging.getLogger(__name__)


class DashboardPermalinkRestApi(BaseZobiApi):
    add_model_schema = DashboardPermalinkStateSchema()
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    allow_browser_login = True
    class_permission_name = "DashboardPermalinkRestApi"
    resource_name = "dashboard"
    openapi_spec_tag = "Dashboard Permanent Link"
    openapi_spec_component_schemas = (DashboardPermalinkStateSchema,)

    @expose("/<pk>/permalink", methods=("POST",))
    @protect()
    @safe
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.post",
        log_to_statsd=False,
    )
    @requires_json
    def post(self, pk: str) -> Response:
        """Create a new dashboard's permanent link.
        ---
        post:
          summary: Create a new dashboard's permanent link
          parameters:
          - in: path
            schema:
              type: string
            name: pk
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/DashboardPermalinkStateSchema'
                examples:
                  time_grain_filter:
                    summary: "Time Grain Filter"
                    value:
                      dataMask:
                        id: NATIVE_FILTER_ID
                        extraFormData:
                          time_grain_sqla: "P1W/1970-01-03T00:00:00Z"
                        filterState:
                          label: "Week ending Saturday"
                          value:
                            - "P1W/1970-01-03T00:00:00Z"
                  timecolumn_filter:
                    summary: "Time Column Filter"
                    value:
                      dataMask:
                        id: NATIVE_FILTER_ID
                        extraFormData:
                          granularity_sqla: "order_date"
                        filterState:
                          value:
                            - "order_date"
                  time_range_filter:
                    summary: "Time Range Filter"
                    value:
                      dataMask:
                        id: NATIVE_FILTER_ID
                        extraFormData:
                          time_range: >-
                            DATEADD(DATETIME("2025-01-16T00:00:00"), -7, day)
                            : 2025-01-16T00:00:00
                        filterState:
                          value: >-
                            DATEADD(DATETIME("2025-01-16T00:00:00"), -7, day)
                            : 2025-01-16T00:00:00
                  numerical_range_filter:
                    summary: "Numerical Range Filter"
                    value:
                      dataMask:
                        id: NATIVE_FILTER_ID
                        extraFormData:
                          filters:
                            - col: "tz_offset"
                              op: ">="
                              val:
                                - 1000
                            - col: "tz_offset"
                              op: "<="
                              val:
                                - 2000
                        filterState:
                          value:
                            - 1000
                            - 2000
                          label: "1000 <= x <= 200"
                  value_filter:
                    summary: "Value Filter"
                    value:
                      dataMask:
                        id: NATIVE_FILTER_ID
                        extraFormData:
                          filters:
                            - col: "real_name"
                              op: "IN"
                              val:
                                - "John Doe"
                        filterState:
                          value:
                            - "John Doe"
          responses:
            201:
              description: The permanent link was stored successfully.
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      key:
                        type: string
                        description: The key to retrieve the permanent link data.
                      url:
                        type: string
                        description: permanent link.
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            422:
              $ref: '#/components/responses/422'
            500:
              $ref: '#/components/responses/500'
        """
        try:
            state = self.add_model_schema.load(request.json)
            key = CreateDashboardPermalinkCommand(
                dashboard_id=pk,
                state=state,
            ).run()
            url = url_for("Zobi.dashboard_permalink", key=key, _external=True)
            return self.response(201, key=key, url=url)
        except (ValidationError, DashboardPermalinkInvalidStateError) as ex:
            return self.response(400, message=str(ex))
        except (
            DashboardAccessDeniedError,
            KeyValueAccessDeniedError,
        ) as ex:
            return self.response(403, message=str(ex))
        except DashboardNotFoundError as ex:
            return self.response(404, message=str(ex))

    @expose("/permalink/<string:key>", methods=("GET",))
    @protect()
    @safe
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.get",
        log_to_statsd=False,
    )
    def get(self, key: str) -> Response:
        """Get dashboard's permanent link state.
        ---
        get:
          summary: Get dashboard's permanent link state
          parameters:
          - in: path
            schema:
              type: string
            name: key
          responses:
            200:
              description: Returns the stored state.
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      state:
                        type: object
                        description: The stored state
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
            value = GetDashboardPermalinkCommand(key=key).run()
            if not value:
                return self.response_404()
            return self.response(200, **value)
        except DashboardAccessDeniedError as ex:
            return self.response(403, message=str(ex))
        except DashboardNotFoundError as ex:
            return self.response(404, message=str(ex))
