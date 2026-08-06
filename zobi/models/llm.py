"""ORM models backing the LLM gateway (Manage > AI Models).

Three tables model what LiteLLM's ``Router`` needs:

- ``llm_providers`` holds credentials once per vendor account.
- ``llm_models`` holds one row per Router *deployment*.
- ``llm_router_config`` is a singleton holding Router-wide settings.

The split exists because a single credential (an OpenRouter key, say) serves
many models, and because credential *shapes* differ per provider: Bedrock needs
AWS keys plus a region, Vertex needs a whole service-account JSON, while most
others just need an API key. Fixed ``api_key``/``api_base`` columns could not
express that, so credentials live in two JSON blobs - one plain, one encrypted -
that are merged into ``litellm_params`` at Router build time.
"""

from __future__ import annotations

import uuid as uuid_module
from typing import Any

from flask_appbuilder import Model
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy_utils import UUIDType

from zobi.constants import PASSWORD_MASK
from zobi.extensions import encrypted_field_factory
from zobi.models.helpers import AuditMixinNullable
from zobi.utils import json


def _loads_dict(raw: str | None) -> dict[str, Any]:
    """Parse a JSON object column, tolerating null/blank/corrupt values.

    Returning ``{}`` rather than raising keeps a single malformed row from
    breaking Router assembly for every other provider.
    """
    if not raw:
        return {}
    try:
        value = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return {}
    return value if isinstance(value, dict) else {}


class LLMProvider(AuditMixinNullable, Model):
    """A configured vendor account - credentials plus connection settings.

    ``params`` and ``encrypted_params`` are both fragments of the
    ``litellm_params`` dict that LiteLLM expects; they are split solely by
    sensitivity so the secret half can be encrypted at rest and masked on the
    way out. Neither is interpreted by Zobi beyond validation against the
    provider's spec in ``zobi/llm/provider_specs.py``.
    """

    __tablename__ = "llm_providers"

    id = Column(Integer, primary_key=True)
    uuid = Column(
        UUIDType(binary=True), nullable=False, unique=True, default=uuid_module.uuid4
    )

    name = Column(String(250), nullable=False, unique=True)
    # Key into the preset registry: "openai", "bedrock", "vertex_ai", "custom", ...
    provider_key = Column(String(100), nullable=False, index=True)

    # Non-secret litellm_params: api_base, api_version, vertex_project, ...
    params = Column(Text, nullable=True, default="{}")
    # Secret litellm_params: api_key, aws_secret_access_key, vertex_credentials, ...
    encrypted_params = Column(encrypted_field_factory.create(Text), nullable=True)

    is_active = Column(Boolean, nullable=False, default=True)

    # Populated by the Test connection action; last_test_error is NULL on success.
    last_tested_at = Column(DateTime, nullable=True)
    last_test_error = Column(Text, nullable=True)

    models = relationship(
        "LLMModel",
        back_populates="provider",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<LLMProvider {self.name} ({self.provider_key})>"

    @property
    def params_dict(self) -> dict[str, Any]:
        return _loads_dict(self.params)

    @property
    def encrypted_params_dict(self) -> dict[str, Any]:
        """Decrypted secret params.

        Callers must never log or serialize the result. The only legitimate
        consumers are Router assembly and the connection test.
        """
        return _loads_dict(self.encrypted_params)

    @property
    def masked_encrypted_params(self) -> dict[str, Any]:
        """Secret params with every value replaced by ``PASSWORD_MASK``.

        Keys are preserved so the form knows which secrets are already set,
        but no value ever leaves the server.
        """
        return {key: PASSWORD_MASK for key in self.encrypted_params_dict}

    @property
    def public_params(self) -> dict[str, Any]:
        """What the API serializes for this provider: plain values, masked secrets.

        Exposed as a property rather than assembled in the API layer so that
        every read path - list, show, related - masks by construction. There
        is no route through which the raw ``encrypted_params`` column can be
        serialized by listing a column name.
        """
        return {**self.params_dict, **self.masked_encrypted_params}

    def credentials(self) -> dict[str, Any]:
        """Full litellm_params fragment for this provider - secrets included."""
        return {**self.params_dict, **self.encrypted_params_dict}


class LLMModel(AuditMixinNullable, Model):
    """One Router deployment: an alias pointing at a concrete model string.

    ``alias`` is intentionally *not* unique. LiteLLM load-balances across every
    deployment sharing a ``model_name``, so two rows with the same alias and
    different providers form a pool with no extra concept needed.
    """

    __tablename__ = "llm_models"

    id = Column(Integer, primary_key=True)
    uuid = Column(
        UUIDType(binary=True), nullable=False, unique=True, default=uuid_module.uuid4
    )

    provider_id = Column(
        Integer, ForeignKey("llm_providers.id"), nullable=False, index=True
    )

    # Router "model_name". Repeats across rows are a load-balanced pool.
    alias = Column(String(250), nullable=False, index=True)
    # Real LiteLLM model, e.g. "openrouter/anthropic/claude-opus-4".
    model_string = Column(String(500), nullable=False)

    supports_chat = Column(Boolean, nullable=False, default=True)
    supports_transcription = Column(Boolean, nullable=False, default=False)
    supports_embeddings = Column(Boolean, nullable=False, default=False)
    supports_vision = Column(Boolean, nullable=False, default=False)

    # Per-deployment limits; NULL means "no limit", which is LiteLLM's default.
    tpm = Column(Integer, nullable=True)
    rpm = Column(Integer, nullable=True)
    max_parallel_requests = Column(Integer, nullable=True)

    max_budget = Column(Float, nullable=True)
    budget_duration = Column(String(50), nullable=True)  # "30s", "30m", "30d"

    # Per-model completion overrides: temperature, max_tokens, ...
    extra_params = Column(Text, nullable=True, default="{}")

    is_active = Column(Boolean, nullable=False, default=True)

    provider = relationship("LLMProvider", back_populates="models")

    def __repr__(self) -> str:
        return f"<LLMModel {self.alias} -> {self.model_string}>"

    @property
    def extra_params_dict(self) -> dict[str, Any]:
        return _loads_dict(self.extra_params)

    def capabilities(self) -> list[str]:
        """Capability names this deployment declares, for display and filtering."""
        flags = {
            "chat": self.supports_chat,
            "transcription": self.supports_transcription,
            "embeddings": self.supports_embeddings,
            "vision": self.supports_vision,
        }
        return [name for name, enabled in flags.items() if enabled]


class LLMRouterConfig(AuditMixinNullable, Model):
    """Router-wide settings. Exactly one row exists, with ``id == 1``.

    The singleton is created by the migration and enforced by
    ``UpdateRouterConfigCommand``; nothing else may insert or delete here.
    """

    __tablename__ = "llm_router_config"

    SINGLETON_ID = 1

    id = Column(Integer, primary_key=True)

    routing_strategy = Column(String(50), nullable=False, default="simple-shuffle")
    num_retries = Column(Integer, nullable=True, default=2)
    timeout = Column(Integer, nullable=True)
    cooldown_time = Column(Integer, nullable=True)
    default_max_parallel_requests = Column(Integer, nullable=True)

    # [{"alias": ["backup-alias", ...]}, ...] - LiteLLM's fallbacks shape.
    fallbacks = Column(Text, nullable=True, default="[]")

    # Which alias each capability resolves to when a caller passes none.
    default_chat_alias = Column(String(250), nullable=True)
    default_transcription_alias = Column(String(250), nullable=True)
    default_embedding_alias = Column(String(250), nullable=True)

    def __repr__(self) -> str:
        return f"<LLMRouterConfig strategy={self.routing_strategy}>"

    @property
    def fallbacks_list(self) -> list[dict[str, list[str]]]:
        if not self.fallbacks:
            return []
        try:
            value = json.loads(self.fallbacks)
        except (json.JSONDecodeError, TypeError):
            return []
        return value if isinstance(value, list) else []

    def referenced_aliases(self) -> set[str]:
        """Every alias named by a default or a fallback chain.

        Used to block deletion of a model whose alias is still wired into
        routing, which would otherwise leave the Router pointing at nothing.
        """
        referenced = {
            self.default_chat_alias,
            self.default_transcription_alias,
            self.default_embedding_alias,
        }
        for entry in self.fallbacks_list:
            for primary, backups in entry.items():
                referenced.add(primary)
                referenced.update(backups)
        return {alias for alias in referenced if alias}
