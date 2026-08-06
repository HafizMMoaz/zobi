"""REST APIs for the LLM gateway.

Three resources: providers (credentials), models (Router deployments), and the
singleton Router config. All three are Admin-only, enforced by adding their
class permission names to ``ADMIN_ONLY_VIEW_MENUS`` in the security manager.

Responses expose ``public_params``, never the underlying ``params`` /
``encrypted_params`` columns, so secrets cannot leak through a column listing.
"""

from __future__ import annotations

import logging
from typing import Any

from flask import request, Response
from flask_appbuilder.api import expose, protect, safe
from flask_appbuilder.models.sqla.interface import SQLAInterface
from marshmallow import ValidationError

from zobi.commands.llm.exceptions import (
    LLMAliasInUseError,
    LLMModelNotFoundError,
    LLMProviderInvalidError,
    LLMProviderNameUsedError,
    LLMProviderNotFoundError,
    LLMUnknownProviderError,
)
from zobi.commands.llm.model import (
    CreateLLMModelCommand,
    DeleteLLMModelCommand,
    UpdateLLMModelCommand,
)
from zobi.commands.llm.provider import (
    CreateLLMProviderCommand,
    DeleteLLMProviderCommand,
    TestLLMProviderCommand,
    UpdateLLMProviderCommand,
)
from zobi.commands.llm.router_config import UpdateRouterConfigCommand
from zobi.constants import MODEL_API_RW_METHOD_PERMISSION_MAP, RouteMethod
from zobi.daos.llm import LLMProviderDAO, LLMRouterConfigDAO
from zobi.extensions import event_logger
from zobi.llm.filters import LLMModelAllTextFilter, LLMProviderAllTextFilter
from zobi.llm.provider_specs import build_available_payload
from zobi.llm.schemas import (
    get_delete_ids_schema,
    LLMModelPostSchema,
    LLMModelPutSchema,
    LLMProviderPostSchema,
    LLMProviderPutSchema,
    LLMProviderTestSchema,
    LLMRouterConfigPutSchema,
    openapi_spec_methods_override,
)
from zobi.models.llm import LLMModel, LLMProvider
from zobi.utils.decorators import transaction
from zobi.views.base_api import BaseZobiModelRestApi, statsd_metrics

logger = logging.getLogger(__name__)


class LLMProviderRestApi(BaseZobiModelRestApi):
    datamodel = SQLAInterface(LLMProvider)

    include_route_methods = RouteMethod.REST_MODEL_VIEW_CRUD_SET | {
        "test_connection",
        "available",
        "provider_models",
    }
    class_permission_name = "LLMProvider"
    method_permission_name = {
        **MODEL_API_RW_METHOD_PERMISSION_MAP,
        "test_connection": "write",
        "available": "read",
        "provider_models": "read",
    }

    resource_name = "llm_provider"
    allow_browser_login = True

    # `public_params` rather than `params`: the raw columns are never listed,
    # so no response can carry a decrypted secret.
    show_columns = [
        "id",
        "uuid",
        "name",
        "provider_key",
        "public_params",
        "is_active",
        "last_tested_at",
        "last_test_error",
        "changed_on_delta_humanized",
        "changed_by.first_name",
        "changed_by.last_name",
    ]
    list_columns = [
        "id",
        "uuid",
        "name",
        "provider_key",
        "public_params",
        "is_active",
        "last_tested_at",
        "last_test_error",
        "changed_on_delta_humanized",
        "changed_by.first_name",
        "changed_by.last_name",
    ]
    list_select_columns = [
        "id",
        "uuid",
        "name",
        "provider_key",
        "params",
        "encrypted_params",
        "is_active",
        "last_tested_at",
        "last_test_error",
        "changed_on",
        "changed_by_fk",
    ]
    order_columns = ["name", "provider_key", "is_active", "changed_on_delta_humanized"]

    add_model_schema = LLMProviderPostSchema()
    edit_model_schema = LLMProviderPutSchema()

    search_filters = {"name": [LLMProviderAllTextFilter]}
    allowed_rel_fields = {"created_by", "changed_by"}

    apispec_parameter_schemas = {"get_delete_ids_schema": get_delete_ids_schema}
    openapi_spec_tag = "LLM Providers"
    openapi_spec_methods = openapi_spec_methods_override

    @expose("/", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.post",
        log_to_statsd=False,
    )
    def post(self) -> Response:
        """Create an LLM provider.
        ---
        post:
          summary: Create an LLM provider
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/LLMProviderPostSchema'
          responses:
            201:
              description: Provider created
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      id:
                        type: integer
                      result:
                        $ref: '#/components/schemas/LLMProviderPostSchema'
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
            item = self.add_model_schema.load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            provider = CreateLLMProviderCommand(item).run()
            return self.response(201, id=provider.id, result=item)
        except LLMProviderNameUsedError as ex:
            return self.response_422(message=str(ex))
        except (LLMProviderInvalidError, LLMUnknownProviderError) as ex:
            return self.response_400(message=str(ex))

    @expose("/<int:pk>", methods=("PUT",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.put",
        log_to_statsd=False,
    )
    def put(self, pk: int) -> Response:
        """Update an LLM provider.
        ---
        put:
          summary: Update an LLM provider
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/LLMProviderPutSchema'
          responses:
            200:
              description: Provider updated
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      id:
                        type: integer
                      result:
                        $ref: '#/components/schemas/LLMProviderPutSchema'
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
            422:
              $ref: '#/components/responses/422'
        """
        try:
            item = self.edit_model_schema.load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            provider = UpdateLLMProviderCommand(pk, item).run()
            return self.response(200, id=provider.id, result=item)
        except LLMProviderNotFoundError:
            return self.response_404()
        except LLMProviderNameUsedError as ex:
            return self.response_422(message=str(ex))
        except (LLMProviderInvalidError, LLMUnknownProviderError) as ex:
            return self.response_400(message=str(ex))

    @expose("/<int:pk>", methods=("DELETE",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.delete",
        log_to_statsd=False,
    )
    def delete(self, pk: int) -> Response:
        """Delete an LLM provider and every model under it.
        ---
        delete:
          summary: Delete an LLM provider
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            200:
              description: Provider deleted
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
        """
        try:
            DeleteLLMProviderCommand(pk).run()
            return self.response(200, message="OK")
        except LLMProviderNotFoundError:
            return self.response_404()

    @expose("/test_connection/", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: (
            f"{self.__class__.__name__}.test_connection"
        ),
        log_to_statsd=False,
    )
    def test_connection(self) -> Response:
        """Verify credentials with one minimal completion.

        Works for unsaved providers, so the form can validate before the admin
        commits. Always returns 200 with a boolean ``result`` - a failed
        credential is an expected answer here, not a server error.
        ---
        post:
          summary: Test LLM provider credentials
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/LLMProviderTestSchema'
          responses:
            200:
              description: Test outcome
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      result:
                        type: boolean
                      error:
                        type: string
                        nullable: true
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
        """
        try:
            item = LLMProviderTestSchema().load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            outcome = TestLLMProviderCommand(item).run()
        except LLMUnknownProviderError as ex:
            return self.response_400(message=str(ex))

        return self.response(200, **outcome)

    @expose("/available/", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    def available(self) -> Response:
        """List provider presets and their form fields.

        The frontend renders the credential form entirely from this payload,
        so adding a provider to the registry makes it selectable with no
        frontend change.
        ---
        get:
          summary: Get available LLM provider presets
          responses:
            200:
              description: Provider presets
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      result:
                        type: array
                        items:
                          type: object
            401:
              $ref: '#/components/responses/401'
        """
        return self.response(200, result=build_available_payload())

    @expose("/<int:pk>/models/", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    def provider_models(self, pk: int) -> Response:
        """List models the vendor reports, where the vendor supports it.

        Returns an empty list for providers with no catalogue endpoint, which
        the UI treats as "type the model string yourself" rather than an error.
        ---
        get:
          summary: Get models available from a provider
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            200:
              description: Model identifiers
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      result:
                        type: array
                        items:
                          type: string
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
        """
        provider = LLMProviderDAO.find_by_id(pk)
        if not provider:
            return self.response_404()

        from zobi.llm.catalogue import list_provider_models  # noqa: PLC0415

        return self.response(200, result=list_provider_models(provider))


class LLMModelRestApi(BaseZobiModelRestApi):
    datamodel = SQLAInterface(LLMModel)

    include_route_methods = RouteMethod.REST_MODEL_VIEW_CRUD_SET
    class_permission_name = "LLMModel"
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP

    resource_name = "llm_model"
    allow_browser_login = True

    show_columns = [
        "id",
        "uuid",
        "provider_id",
        "provider.name",
        "provider.provider_key",
        "alias",
        "model_string",
        "supports_chat",
        "supports_transcription",
        "supports_embeddings",
        "supports_vision",
        "tpm",
        "rpm",
        "max_parallel_requests",
        "max_budget",
        "budget_duration",
        "extra_params",
        "is_active",
    ]
    list_columns = show_columns + ["changed_on_delta_humanized"]
    list_select_columns = [
        col for col in list_columns if "." not in col and col != "provider_id"
    ] + ["provider_id", "changed_on", "changed_by_fk"]
    order_columns = ["alias", "model_string", "is_active"]

    add_model_schema = LLMModelPostSchema()
    edit_model_schema = LLMModelPutSchema()

    search_filters = {"alias": [LLMModelAllTextFilter]}
    allowed_rel_fields = {"provider", "created_by", "changed_by"}

    apispec_parameter_schemas = {"get_delete_ids_schema": get_delete_ids_schema}
    openapi_spec_tag = "LLM Models"

    @expose("/", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.post",
        log_to_statsd=False,
    )
    def post(self) -> Response:
        """Create an LLM model deployment.
        ---
        post:
          summary: Create an LLM model
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/LLMModelPostSchema'
          responses:
            201:
              description: Model created
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      id:
                        type: integer
                      result:
                        $ref: '#/components/schemas/LLMModelPostSchema'
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
        """
        try:
            item = self.add_model_schema.load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            model = CreateLLMModelCommand(item).run()
            return self.response(201, id=model.id, result=item)
        except LLMProviderNotFoundError:
            return self.response_404()

    @expose("/<int:pk>", methods=("PUT",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.put",
        log_to_statsd=False,
    )
    def put(self, pk: int) -> Response:
        """Update an LLM model deployment.
        ---
        put:
          summary: Update an LLM model
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/LLMModelPutSchema'
          responses:
            200:
              description: Model updated
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      id:
                        type: integer
                      result:
                        $ref: '#/components/schemas/LLMModelPutSchema'
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
        """
        try:
            item = self.edit_model_schema.load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            model = UpdateLLMModelCommand(pk, item).run()
            return self.response(200, id=model.id, result=item)
        except (LLMModelNotFoundError, LLMProviderNotFoundError):
            return self.response_404()

    @expose("/<int:pk>", methods=("DELETE",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.delete",
        log_to_statsd=False,
    )
    def delete(self, pk: int) -> Response:
        """Delete an LLM model deployment.
        ---
        delete:
          summary: Delete an LLM model
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            200:
              description: Model deleted
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
        """
        try:
            DeleteLLMModelCommand(pk).run()
            return self.response(200, message="OK")
        except LLMModelNotFoundError:
            return self.response_404()
        except LLMAliasInUseError as ex:
            return self.response_422(message=str(ex))


class LLMRouterConfigRestApi(BaseZobiModelRestApi):
    """The singleton Router config.

    Not a normal CRUD resource: there is exactly one row, so it exposes a
    GET/PUT pair on a bare path rather than id-addressed routes.
    """

    datamodel = SQLAInterface(LLMModel)  # unused; required by the base class
    include_route_methods = {"get_config", "put_config"}
    class_permission_name = "LLMRouterConfig"
    method_permission_name = {"get_config": "read", "put_config": "write"}

    resource_name = "llm_router_config"
    allow_browser_login = True
    openapi_spec_tag = "LLM Router Config"

    @expose("/", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    def get_config(self) -> Response:
        """Get the Router configuration.
        ---
        get:
          summary: Get LLM router configuration
          responses:
            200:
              description: Router configuration
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      result:
                        type: object
            401:
              $ref: '#/components/responses/401'
        """
        config = LLMRouterConfigDAO.get_singleton()
        return self.response(200, result=self._serialize(config))

    @expose("/", methods=("PUT",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.put_config",
        log_to_statsd=False,
    )
    @transaction()
    def put_config(self) -> Response:
        """Update the Router configuration.
        ---
        put:
          summary: Update LLM router configuration
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/LLMRouterConfigPutSchema'
          responses:
            200:
              description: Router configuration updated
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      result:
                        type: object
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
        """
        try:
            item = LLMRouterConfigPutSchema().load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            config = UpdateRouterConfigCommand(item).run()
        except ValidationError as error:
            return self.response_400(message=error.messages)

        return self.response(200, result=self._serialize(config))

    @staticmethod
    def _serialize(config: Any) -> dict[str, Any]:
        """Flatten the config row, restoring fallbacks to the API's shape.

        Stored in LiteLLM's ``{primary: [backups]}`` form for pass-through at
        Router build time; the API uses explicit keys because a single-key
        object is awkward to validate and to render.
        """
        return {
            "routing_strategy": config.routing_strategy,
            "num_retries": config.num_retries,
            "timeout": config.timeout,
            "cooldown_time": config.cooldown_time,
            "default_max_parallel_requests": config.default_max_parallel_requests,
            "fallbacks": [
                {"primary": primary, "backups": backups}
                for entry in config.fallbacks_list
                for primary, backups in entry.items()
            ],
            "default_chat_alias": config.default_chat_alias,
            "default_transcription_alias": config.default_transcription_alias,
            "default_embedding_alias": config.default_embedding_alias,
        }
