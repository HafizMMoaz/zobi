"""Create, update, delete and test LLM model deployments."""

from __future__ import annotations

import logging
from functools import partial
from typing import Any, Optional

from zobi.commands.base import BaseCommand, CreateMixin, UpdateMixin
from zobi.commands.llm.exceptions import (
    LLMAliasInUseError,
    LLMModelNotFoundError,
    LLMProviderNotFoundError,
)
from zobi.daos.llm import LLMModelDAO, LLMProviderDAO, LLMRouterConfigDAO
from zobi.llm.provider_specs import get_spec
from zobi.llm.router import clear_router_cache
from zobi.models.llm import LLMModel
from zobi.utils import json
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


def _qualify_model_string(provider_key: str, model_string: str) -> str:
    """Prefix the model string with the provider's LiteLLM namespace if absent.

    Admins routinely paste a bare model name from a vendor's docs
    ("claude-sonnet-4-5") where LiteLLM needs the namespaced form
    ("anthropic/claude-sonnet-4-5"). Adding the prefix here turns the single
    most common configuration mistake into a non-event, while leaving an
    already-qualified string untouched.
    """
    prefix = get_spec(provider_key).model_prefix
    if prefix and not model_string.startswith(prefix):
        return f"{prefix}{model_string}"
    return model_string


class CreateLLMModelCommand(CreateMixin, BaseCommand):
    def __init__(self, data: dict[str, Any]):
        self._properties = data.copy()

    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> LLMModel:
        self.validate()

        provider = LLMProviderDAO.find_by_id(self._properties["provider_id"])
        assert provider
        self._properties["model_string"] = _qualify_model_string(
            provider.provider_key, self._properties["model_string"]
        )
        self._properties["extra_params"] = json.dumps(
            self._properties.get("extra_params") or {}
        )

        model = LLMModelDAO.create(attributes=self._properties)
        clear_router_cache()
        return model

    def validate(self) -> None:
        if not LLMProviderDAO.find_by_id(self._properties["provider_id"]):
            raise LLMProviderNotFoundError()


class UpdateLLMModelCommand(UpdateMixin, BaseCommand):
    def __init__(self, model_id: int, data: dict[str, Any]):
        self._model_id = model_id
        self._properties = data.copy()
        self._model: Optional[LLMModel] = None

    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> LLMModel:
        self.validate()
        assert self._model

        if "model_string" in self._properties:
            provider_id = self._properties.get("provider_id", self._model.provider_id)
            provider = LLMProviderDAO.find_by_id(provider_id)
            assert provider
            self._properties["model_string"] = _qualify_model_string(
                provider.provider_key, self._properties["model_string"]
            )

        if "extra_params" in self._properties:
            self._properties["extra_params"] = json.dumps(
                self._properties["extra_params"] or {}
            )

        model = LLMModelDAO.update(self._model, self._properties)
        clear_router_cache()
        return model

    def validate(self) -> None:
        self._model = LLMModelDAO.find_by_id(self._model_id)
        if not self._model:
            raise LLMModelNotFoundError()

        if (provider_id := self._properties.get("provider_id")) and not (
            LLMProviderDAO.find_by_id(provider_id)
        ):
            raise LLMProviderNotFoundError()


class DeleteLLMModelCommand(BaseCommand):
    def __init__(self, model_id: int):
        self._model_id = model_id
        self._model: Optional[LLMModel] = None

    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> None:
        self.validate()
        assert self._model
        LLMModelDAO.delete([self._model])
        clear_router_cache()

    def validate(self) -> None:
        self._model = LLMModelDAO.find_by_id(self._model_id)
        if not self._model:
            raise LLMModelNotFoundError()

        # Removing one deployment from a pool is always fine; removing the last
        # one behind a routed alias is what breaks routing.
        config = LLMRouterConfigDAO.get_singleton()
        if self._model.alias in config.referenced_aliases():
            if not LLMModelDAO.alias_has_siblings(self._model.alias, self._model.id):
                raise LLMAliasInUseError()
