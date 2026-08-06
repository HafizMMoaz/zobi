"""Marshmallow schemas for the LLM gateway API.

The rule this module exists to enforce: **a secret never appears in a
response**. Provider params go out with secret values replaced by
``PASSWORD_MASK`` (see ``LLMProvider.public_params``), and come back in
through :func:`~zobi.llm.utils.merge_masked_params`, which restores the stored
value wherever the mask is echoed.
"""

from __future__ import annotations

from typing import Any

from flask_babel import lazy_gettext as _
from marshmallow import fields, Schema, validates, validates_schema, ValidationError
from marshmallow.validate import Length, OneOf, Range

from zobi.llm.provider_specs import PROVIDER_SPECS, validate_params

#: LiteLLM's supported Router strategies.
ROUTING_STRATEGIES = [
    "simple-shuffle",
    "least-busy",
    "usage-based-routing",
    "latency-based-routing",
]

CAPABILITY_FIELDS = [
    "supports_chat",
    "supports_transcription",
    "supports_embeddings",
    "supports_vision",
]

openapi_spec_methods_override = {
    "get": {"get": {"summary": "Get an LLM provider"}},
    "get_list": {
        "get": {
            "summary": "Get a list of LLM providers",
            "description": "Gets a list of LLM providers, use Rison or JSON "
            "query parameters for filtering, sorting and pagination. "
            "Secret credentials are always masked.",
        }
    },
    "post": {"post": {"summary": "Create an LLM provider"}},
    "put": {"put": {"summary": "Update an LLM provider"}},
    "delete": {"delete": {"summary": "Delete an LLM provider"}},
}


def get_delete_ids_schema() -> dict[str, Any]:
    return {"type": "array", "items": {"type": "integer"}}


class LLMProviderPostSchema(Schema):
    """Create a provider.

    ``params`` is a single flat dict holding both plain and secret values; the
    command splits it by the provider spec. Keeping it flat means the form does
    not have to know which of its fields are secret - the server decides, from
    one authoritative place.
    """

    name = fields.String(required=True, validate=Length(1, 250))
    provider_key = fields.String(
        required=True,
        validate=OneOf(list(PROVIDER_SPECS)),
    )
    params = fields.Dict(keys=fields.String(), required=True)
    is_active = fields.Boolean(load_default=True)

    @validates_schema
    def validate_provider_params(self, data: dict[str, Any], **_kw: Any) -> None:
        if errors := validate_params(data["provider_key"], data.get("params") or {}):
            raise ValidationError({"params": errors})


class LLMProviderPutSchema(Schema):
    """Update a provider.

    Required-field validation is skipped here because a partial update need not
    resend credentials, and any secret the admin did resend arrives masked -
    checking it against the spec would compare against ``XXXXXXXXXX`` rather
    than the real value. The command validates the merged result instead.
    """

    name = fields.String(validate=Length(1, 250))
    params = fields.Dict(keys=fields.String())
    is_active = fields.Boolean()


class LLMProviderTestSchema(Schema):
    """Test credentials that may not be saved yet."""

    provider_key = fields.String(required=True, validate=OneOf(list(PROVIDER_SPECS)))
    params = fields.Dict(keys=fields.String(), required=True)
    model_string = fields.String(required=True, validate=Length(1, 500))
    # Set when testing an existing provider, so masked secrets can be resolved
    # against what is stored.
    provider_id = fields.Integer(allow_none=True, load_default=None)


class LLMModelPostSchema(Schema):
    provider_id = fields.Integer(required=True)
    alias = fields.String(required=True, validate=Length(1, 250))
    model_string = fields.String(required=True, validate=Length(1, 500))

    supports_chat = fields.Boolean(load_default=True)
    supports_transcription = fields.Boolean(load_default=False)
    supports_embeddings = fields.Boolean(load_default=False)
    supports_vision = fields.Boolean(load_default=False)

    tpm = fields.Integer(allow_none=True, validate=Range(min=1))
    rpm = fields.Integer(allow_none=True, validate=Range(min=1))
    max_parallel_requests = fields.Integer(allow_none=True, validate=Range(min=1))
    max_budget = fields.Float(allow_none=True, validate=Range(min=0))
    budget_duration = fields.String(allow_none=True, validate=Length(0, 50))

    extra_params = fields.Dict(keys=fields.String(), load_default=dict)
    is_active = fields.Boolean(load_default=True)

    @validates_schema
    def validate_at_least_one_capability(
        self, data: dict[str, Any], **_kw: Any
    ) -> None:
        """A deployment with no capability can never be routed to.

        It would sit in the model list, count towards the pool, and never be
        selected - a silent misconfiguration, so reject it at the door.
        """
        if not any(data.get(name) for name in CAPABILITY_FIELDS):
            raise ValidationError(
                {"supports_chat": [str(_("Select at least one capability"))]}
            )


class LLMModelPutSchema(Schema):
    provider_id = fields.Integer()
    alias = fields.String(validate=Length(1, 250))
    model_string = fields.String(validate=Length(1, 500))

    supports_chat = fields.Boolean()
    supports_transcription = fields.Boolean()
    supports_embeddings = fields.Boolean()
    supports_vision = fields.Boolean()

    tpm = fields.Integer(allow_none=True, validate=Range(min=1))
    rpm = fields.Integer(allow_none=True, validate=Range(min=1))
    max_parallel_requests = fields.Integer(allow_none=True, validate=Range(min=1))
    max_budget = fields.Float(allow_none=True, validate=Range(min=0))
    budget_duration = fields.String(allow_none=True, validate=Length(0, 50))

    extra_params = fields.Dict(keys=fields.String())
    is_active = fields.Boolean()


class LLMFallbackEntrySchema(Schema):
    """One link in a fallback chain: a primary alias and its ordered backups."""

    primary = fields.String(required=True, validate=Length(1, 250))
    backups = fields.List(
        fields.String(validate=Length(1, 250)),
        required=True,
        validate=Length(min=1),
    )

    @validates("backups")
    def validate_no_self_reference(self, value: list[str]) -> None:
        """A chain naming its own primary would retry the failed deployment."""
        # `primary` is not available here, so duplicates within backups are all
        # we can catch; the self-reference check lives in the schema below.
        if len(set(value)) != len(value):
            raise ValidationError(str(_("Fallback aliases must be unique")))

    @validates_schema
    def validate_primary_not_in_backups(self, data: dict[str, Any], **_kw: Any) -> None:
        if data.get("primary") in (data.get("backups") or []):
            raise ValidationError(
                {"backups": [str(_("An alias cannot fall back to itself"))]}
            )


class LLMRouterConfigPutSchema(Schema):
    routing_strategy = fields.String(validate=OneOf(ROUTING_STRATEGIES))
    num_retries = fields.Integer(allow_none=True, validate=Range(min=0, max=10))
    timeout = fields.Integer(allow_none=True, validate=Range(min=1))
    cooldown_time = fields.Integer(allow_none=True, validate=Range(min=0))
    default_max_parallel_requests = fields.Integer(
        allow_none=True, validate=Range(min=1)
    )

    fallbacks = fields.List(fields.Nested(LLMFallbackEntrySchema))

    default_chat_alias = fields.String(allow_none=True, validate=Length(0, 250))
    default_transcription_alias = fields.String(
        allow_none=True, validate=Length(0, 250)
    )
    default_embedding_alias = fields.String(allow_none=True, validate=Length(0, 250))
