"""Create, update, delete and test LLM providers."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from functools import partial
from typing import Any, Optional

from zobi.commands.base import BaseCommand, CreateMixin, UpdateMixin
from zobi.commands.llm.exceptions import (
    LLMProviderInvalidError,
    LLMProviderNameUsedError,
    LLMProviderNotFoundError,
    LLMUnknownProviderError,
)
from zobi.daos.llm import LLMProviderDAO
from zobi.llm.provider_specs import (
    get_spec,
    split_params,
    UnknownProviderError,
    validate_params,
)
from zobi.llm.router import clear_router_cache
from zobi.llm.utils import merge_masked_params
from zobi.models.llm import LLMProvider
from zobi.utils import json
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


def _persist_params(provider_key: str, params: dict[str, Any]) -> dict[str, Any]:
    """Split params by sensitivity into the two storage columns."""
    plain, secret = split_params(provider_key, params)
    return {
        "params": json.dumps(plain),
        "encrypted_params": json.dumps(secret) if secret else None,
    }


class CreateLLMProviderCommand(CreateMixin, BaseCommand):
    def __init__(self, data: dict[str, Any]):
        self._properties = data.copy()

    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> LLMProvider:
        self.validate()
        provider_key = self._properties["provider_key"]
        params = self._properties.pop("params", {})
        self._properties.update(_persist_params(provider_key, params))

        provider = LLMProviderDAO.create(attributes=self._properties)
        # A new provider has no models yet, so it cannot change routing - but
        # clearing keeps the cache honest if models are added in the same request.
        clear_router_cache()
        return provider

    def validate(self) -> None:
        try:
            get_spec(self._properties["provider_key"])
        except UnknownProviderError as ex:
            raise LLMUnknownProviderError(str(ex)) from ex

        if LLMProviderDAO.find_by_name(self._properties["name"]):
            raise LLMProviderNameUsedError()

        if errors := validate_params(
            self._properties["provider_key"],
            self._properties.get("params") or {},
        ):
            raise LLMProviderInvalidError("; ".join(errors))


class UpdateLLMProviderCommand(UpdateMixin, BaseCommand):
    def __init__(self, model_id: int, data: dict[str, Any]):
        self._model_id = model_id
        self._properties = data.copy()
        self._model: Optional[LLMProvider] = None

    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> LLMProvider:
        self.validate()
        assert self._model

        if "params" in self._properties:
            # Masked placeholders resolve against what is already stored, so a
            # save that did not retype credentials preserves them.
            merged = merge_masked_params(self._properties.pop("params"), self._model)
            self._properties.update(_persist_params(self._model.provider_key, merged))

        provider = LLMProviderDAO.update(self._model, self._properties)
        clear_router_cache()
        return provider

    def validate(self) -> None:
        self._model = LLMProviderDAO.find_by_id(self._model_id)
        if not self._model:
            raise LLMProviderNotFoundError()

        name = self._properties.get("name")
        if name and name != self._model.name:
            if LLMProviderDAO.find_by_name(name):
                raise LLMProviderNameUsedError()

        # Validate the merged result, not the submission: a partial update may
        # legitimately omit required fields that are already stored.
        if "params" in self._properties:
            merged = merge_masked_params(self._properties["params"], self._model)
            if errors := validate_params(self._model.provider_key, merged):
                raise LLMProviderInvalidError("; ".join(errors))


class DeleteLLMProviderCommand(BaseCommand):
    def __init__(self, model_id: int):
        self._model_id = model_id
        self._model: Optional[LLMProvider] = None

    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> None:
        self.validate()
        assert self._model
        # Models cascade with the provider; the API warns about this before
        # calling, since losing deployments silently would be surprising.
        LLMProviderDAO.delete([self._model])
        clear_router_cache()

    def validate(self) -> None:
        self._model = LLMProviderDAO.find_by_id(self._model_id)
        if not self._model:
            raise LLMProviderNotFoundError()


class TestLLMProviderCommand(BaseCommand):
    """Run one minimal completion to prove credentials work.

    Accepts unsaved params so the form can verify before committing. When
    ``provider_id`` is supplied, masked secrets resolve against the stored
    provider, letting an admin re-test without retyping their key.
    """

    def __init__(self, data: dict[str, Any]):
        self._provider_key = data["provider_key"]
        self._params = data["params"]
        self._model_string = data["model_string"]
        self._provider_id = data.get("provider_id")

    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> dict[str, Any]:
        from zobi.llm.service import test_credentials  # noqa: PLC0415

        self.validate()

        provider = (
            LLMProviderDAO.find_by_id(self._provider_id) if self._provider_id else None
        )

        params = self._params
        if provider:
            params = merge_masked_params(params, provider)

        ok, error = test_credentials(self._provider_key, params, self._model_string)

        # Record the outcome so the list view can show status without retesting.
        if provider:
            provider.last_tested_at = datetime.now(timezone.utc)
            # Truncated because provider errors can carry very long payloads.
            provider.last_test_error = None if ok else (error or "")[:2000]

        return {"result": ok, "error": error}

    def validate(self) -> None:
        try:
            get_spec(self._provider_key)
        except UnknownProviderError as ex:
            raise LLMUnknownProviderError(str(ex)) from ex
