"""Update the singleton Router configuration."""

from __future__ import annotations

import logging
from functools import partial
from typing import Any

from marshmallow import ValidationError

from zobi.commands.base import BaseCommand
from zobi.daos.llm import LLMModelDAO, LLMRouterConfigDAO
from zobi.llm.router import clear_router_cache
from zobi.models.llm import LLMRouterConfig
from zobi.utils import json
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class UpdateRouterConfigCommand(BaseCommand):
    """Write Router-wide settings.

    Also the guard on the singleton invariant: this is the only write path, and
    it always targets ``SINGLETON_ID``, so no second config row can appear.
    """

    def __init__(self, data: dict[str, Any]):
        self._properties = data.copy()

    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> LLMRouterConfig:
        self.validate()
        config = LLMRouterConfigDAO.get_singleton()

        if "fallbacks" in self._properties:
            # Stored in LiteLLM's own shape - {primary: [backups]} - so Router
            # assembly can pass it straight through without translation.
            self._properties["fallbacks"] = json.dumps(
                [
                    {entry["primary"]: entry["backups"]}
                    for entry in self._properties["fallbacks"]
                ]
            )

        for key, value in self._properties.items():
            setattr(config, key, value)

        clear_router_cache()
        return config

    def validate(self) -> None:
        """Reject routing that points at aliases no deployment serves.

        Without this, a typo in a default alias produces a Router that builds
        fine and fails only when someone finally sends a message.
        """
        referenced: set[str] = set()

        for attr in (
            "default_chat_alias",
            "default_transcription_alias",
            "default_embedding_alias",
        ):
            if alias := self._properties.get(attr):
                referenced.add(alias)

        for entry in self._properties.get("fallbacks") or []:
            referenced.add(entry["primary"])
            referenced.update(entry["backups"])

        unknown = sorted(
            alias for alias in referenced if not LLMModelDAO.find_by_alias(alias)
        )
        if unknown:
            raise ValidationError(
                {
                    "fallbacks": [
                        f"No model is configured with alias(es): {', '.join(unknown)}"
                    ]
                }
            )
