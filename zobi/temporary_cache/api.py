import contextlib
import logging
from abc import ABC, abstractmethod
from typing import Any

from apispec import APISpec
from apispec.exceptions import DuplicateComponentNameError
from flask import request, Response
from marshmallow import ValidationError

from zobi.commands.temporary_cache.exceptions import (
    TemporaryCacheAccessDeniedError,
    TemporaryCacheResourceNotFoundError,
)
from zobi.commands.temporary_cache.parameters import CommandParameters
from zobi.constants import MODEL_API_RW_METHOD_PERMISSION_MAP, RouteMethod
from zobi.key_value.types import JsonKeyValueCodec
from zobi.temporary_cache.schemas import (
    TemporaryCachePostSchema,
    TemporaryCachePutSchema,
)
from zobi.views.base_api import BaseZobiApi, requires_json

logger = logging.getLogger(__name__)

CODEC = JsonKeyValueCodec()


class TemporaryCacheRestApi(BaseZobiApi, ABC):
    add_model_schema = TemporaryCachePostSchema()
    edit_model_schema = TemporaryCachePutSchema()
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    include_route_methods = {
        RouteMethod.POST,
        RouteMethod.PUT,
        RouteMethod.GET,
        RouteMethod.DELETE,
    }
    allow_browser_login = True

    def add_apispec_components(self, api_spec: APISpec) -> None:
        with contextlib.suppress(DuplicateComponentNameError):
            api_spec.components.schema(
                TemporaryCachePostSchema.__name__,
                schema=TemporaryCachePostSchema,
            )
            api_spec.components.schema(
                TemporaryCachePutSchema.__name__,
                schema=TemporaryCachePutSchema,
            )
        super().add_apispec_components(api_spec)

    @requires_json
    def post(self, pk: int) -> Response:
        try:
            item = self.add_model_schema.load(request.json)
            tab_id = request.args.get("tab_id")
            args = CommandParameters(
                resource_id=pk,
                value=item["value"],
                tab_id=tab_id,
                codec=CODEC,
            )
            key = self.get_create_command()(args).run()
            return self.response(201, key=key)
        except ValidationError as ex:
            return self.response(400, message=ex.messages)
        except TemporaryCacheAccessDeniedError as ex:
            return self.response(403, message=str(ex))
        except TemporaryCacheResourceNotFoundError as ex:
            return self.response(404, message=str(ex))

    @requires_json
    def put(self, pk: int, key: str) -> Response:
        try:
            item = self.edit_model_schema.load(request.json)
            tab_id = request.args.get("tab_id")
            args = CommandParameters(
                resource_id=pk,
                key=key,
                value=item["value"],
                tab_id=tab_id,
                codec=CODEC,
            )
            key = self.get_update_command()(args).run()
            return self.response(200, key=key)
        except ValidationError as ex:
            return self.response(400, message=ex.messages)
        except TemporaryCacheAccessDeniedError as ex:
            return self.response(403, message=str(ex))
        except TemporaryCacheResourceNotFoundError as ex:
            return self.response(404, message=str(ex))

    def get(self, pk: int, key: str) -> Response:
        try:
            args = CommandParameters(resource_id=pk, key=key, codec=CODEC)
            value = self.get_get_command()(args).run()
            if not value:
                return self.response_404()
            return self.response(200, value=value)
        except TemporaryCacheAccessDeniedError as ex:
            return self.response(403, message=str(ex))
        except TemporaryCacheResourceNotFoundError as ex:
            return self.response(404, message=str(ex))

    def delete(self, pk: int, key: str) -> Response:
        try:
            args = CommandParameters(resource_id=pk, key=key)
            result = self.get_delete_command()(args).run()
            if not result:
                return self.response_404()
            return self.response(200, message="Deleted successfully")
        except TemporaryCacheAccessDeniedError as ex:
            return self.response(403, message=str(ex))
        except TemporaryCacheResourceNotFoundError as ex:
            return self.response(404, message=str(ex))

    @abstractmethod
    def get_create_command(self) -> Any: ...

    @abstractmethod
    def get_update_command(self) -> Any: ...

    @abstractmethod
    def get_get_command(self) -> Any: ...

    @abstractmethod
    def get_delete_command(self) -> Any: ...
