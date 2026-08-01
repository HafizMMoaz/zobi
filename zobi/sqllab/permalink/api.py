import logging

from flask import request, Response, url_for
from flask_appbuilder.api import expose, protect, safe
from marshmallow import ValidationError

from zobi.commands.sql_lab.permalink.create import CreateSqlLabPermalinkCommand
from zobi.commands.sql_lab.permalink.get import GetSqlLabPermalinkCommand
from zobi.constants import MODEL_API_RW_METHOD_PERMISSION_MAP
from zobi.extensions import event_logger
from zobi.key_value.exceptions import KeyValueAccessDeniedError
from zobi.sqllab.permalink.exceptions import SqlLabPermalinkInvalidStateError
from zobi.sqllab.permalink.schemas import SqlLabPermalinkSchema
from zobi.views.base_api import BaseZobiApi, requires_json, statsd_metrics

logger = logging.getLogger(__name__)


class SqlLabPermalinkRestApi(BaseZobiApi):
    add_model_schema = SqlLabPermalinkSchema()
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    allow_browser_login = True
    class_permission_name = "SqlLabPermalinkRestApi"
    resource_name = "sqllab"
    openapi_spec_tag = "SQL Lab Permanent Link"
    openapi_spec_component_schemas = (SqlLabPermalinkSchema,)

    @expose("/permalink", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.post",
        log_to_statsd=False,
    )
    @requires_json
    def post(self) -> Response:
        """Create a new permanent link for SQL Lab editor
        ---
        post:
          summary: Create a new permanent link
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/ExplorePermalinkStateSchema'
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
            key = CreateSqlLabPermalinkCommand(state=state).run()
            url = url_for("SqllabView.permalink_view", permalink=key, _external=True)
            return self.response(201, key=key, url=url)
        except ValidationError as ex:
            return self.response(400, message=ex.messages)
        except KeyValueAccessDeniedError as ex:
            return self.response(403, message=str(ex))

    @expose("/permalink/<string:key>", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.get",
        log_to_statsd=False,
    )
    def get(self, key: str) -> Response:
        """Get permanent link state for SQLLab editor.
        ---
        get:
          summary: Get permanent link state for SQLLab editor.
          parameters:
          - in: path
            schema:
              type: string
            name: key
          responses:
            200:
              description: Returns the stored form_data.
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
            value = GetSqlLabPermalinkCommand(key=key).run()
            if not value:
                return self.response_404()
            return self.response(200, **value)
        except SqlLabPermalinkInvalidStateError as ex:
            return self.response(400, message=str(ex))
