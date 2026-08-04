"""Preset registry describing the credential form for each LLM provider.

These specs are *data*, not behavior - deliberately unlike ``db_engine_specs``,
which is a class hierarchy because engines genuinely differ in how they build
URLs, quote identifiers and parse errors. Here every provider ends up calling
the same ``litellm`` entry point; the only thing that varies is which keys go
into ``litellm_params`` and which of them are secret. A registry of dataclasses
expresses that without ceremony.

The ``custom`` spec is the escape hatch: it accepts an arbitrary model string
and arbitrary params, so a provider LiteLLM supports but this registry has not
enumerated is still reachable from the UI. Adding a preset is a convenience,
never a precondition.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from flask_babel import lazy_gettext as _


@dataclass(frozen=True)
class ProviderField:
    """One input in the provider form.

    ``secret`` decides which of the two storage columns the value lands in, so
    it is the single most important attribute here: a field marked non-secret
    is stored in plaintext and returned by the API.
    """

    name: str
    label: str
    required: bool = False
    secret: bool = False
    # "text" | "password" | "textarea" - textarea is for pasted JSON blobs.
    field_type: str = "text"
    placeholder: str = ""
    help_text: str = ""
    default: str | None = None


@dataclass(frozen=True)
class ProviderSpec:
    """A selectable provider preset."""

    key: str
    label: str
    # Prefix LiteLLM expects on model strings, e.g. "openrouter/". Empty for
    # ``custom``, where the admin supplies the whole string themselves.
    model_prefix: str
    fields: list[ProviderField] = field(default_factory=list)
    # True where the vendor exposes a listable model catalogue we can fetch.
    supports_model_listing: bool = False
    # Shown under the provider name in the picker.
    description: str = ""
    # Free-form extra params allowed beyond the declared fields.
    allows_extra_params: bool = False
    docs_url: str = ""

    @property
    def secret_field_names(self) -> set[str]:
        return {f.name for f in self.fields if f.secret}

    @property
    def required_field_names(self) -> set[str]:
        return {f.name for f in self.fields if f.required}


def _api_key_field(label: str = "API key") -> ProviderField:
    return ProviderField(
        name="api_key",
        label=str(_(label)),
        required=True,
        secret=True,
        field_type="password",
    )


def _api_base_field(
    required: bool = False,
    placeholder: str = "",
    help_text: str = "",
) -> ProviderField:
    return ProviderField(
        name="api_base",
        label=str(_("API base URL")),
        required=required,
        placeholder=placeholder,
        help_text=help_text or str(_("Override for proxies or self-hosted gateways")),
    )


#: Every preset, in the order the picker shows them. Widely used providers
#: first, ``custom`` last so it reads as the fallback it is.
PROVIDER_SPECS: dict[str, ProviderSpec] = {
    spec.key: spec
    for spec in [
        ProviderSpec(
            key="openai",
            label="OpenAI",
            model_prefix="openai/",
            description=str(_("GPT models direct from OpenAI")),
            supports_model_listing=True,
            docs_url="https://docs.litellm.ai/docs/providers/openai",
            fields=[
                _api_key_field(),
                _api_base_field(),
                ProviderField(
                    name="organization",
                    label=str(_("Organization ID")),
                    help_text=str(_("Only needed for multi-org accounts")),
                ),
            ],
        ),
        ProviderSpec(
            key="anthropic",
            label="Anthropic",
            model_prefix="anthropic/",
            description=str(_("Claude models direct from Anthropic")),
            docs_url="https://docs.litellm.ai/docs/providers/anthropic",
            fields=[_api_key_field(), _api_base_field()],
        ),
        ProviderSpec(
            key="openrouter",
            label="OpenRouter",
            model_prefix="openrouter/",
            description=str(_("One key, hundreds of models across vendors")),
            supports_model_listing=True,
            docs_url="https://docs.litellm.ai/docs/providers/openrouter",
            fields=[_api_key_field(), _api_base_field()],
        ),
        ProviderSpec(
            key="gemini",
            label="Google Gemini",
            model_prefix="gemini/",
            description=str(_("Gemini via Google AI Studio API keys")),
            docs_url="https://docs.litellm.ai/docs/providers/gemini",
            fields=[_api_key_field()],
        ),
        ProviderSpec(
            key="vertex_ai",
            label="Google Vertex AI",
            model_prefix="vertex_ai/",
            description=str(_("Gemini and partner models on Google Cloud")),
            docs_url="https://docs.litellm.ai/docs/providers/vertex",
            fields=[
                ProviderField(
                    name="vertex_credentials",
                    label=str(_("Service account JSON")),
                    required=True,
                    secret=True,
                    field_type="textarea",
                    help_text=str(
                        _("Paste the full contents of the service account key file")
                    ),
                ),
                ProviderField(
                    name="vertex_project",
                    label=str(_("GCP project ID")),
                    required=True,
                ),
                ProviderField(
                    name="vertex_location",
                    label=str(_("Location")),
                    required=True,
                    placeholder="us-central1",
                ),
            ],
        ),
        ProviderSpec(
            key="bedrock",
            label="Amazon Bedrock",
            model_prefix="bedrock/",
            description=str(_("Claude, Llama and Titan models on AWS")),
            docs_url="https://docs.litellm.ai/docs/providers/bedrock",
            fields=[
                ProviderField(
                    name="aws_access_key_id",
                    label=str(_("AWS access key ID")),
                    required=True,
                    secret=True,
                    field_type="password",
                ),
                ProviderField(
                    name="aws_secret_access_key",
                    label=str(_("AWS secret access key")),
                    required=True,
                    secret=True,
                    field_type="password",
                ),
                ProviderField(
                    name="aws_region_name",
                    label=str(_("AWS region")),
                    required=True,
                    placeholder="us-east-1",
                ),
                ProviderField(
                    name="aws_session_token",
                    label=str(_("Session token")),
                    secret=True,
                    field_type="password",
                    help_text=str(_("Only for temporary STS credentials")),
                ),
                ProviderField(
                    name="aws_role_name",
                    label=str(_("Assume role ARN")),
                    help_text=str(_("Optional role to assume per request")),
                ),
            ],
        ),
        ProviderSpec(
            key="azure",
            label="Azure OpenAI",
            model_prefix="azure/",
            description=str(_("OpenAI models hosted on Azure deployments")),
            docs_url="https://docs.litellm.ai/docs/providers/azure",
            fields=[
                _api_key_field(),
                _api_base_field(
                    required=True,
                    placeholder="https://my-resource.openai.azure.com",
                    help_text=str(_("Your Azure OpenAI resource endpoint")),
                ),
                ProviderField(
                    name="api_version",
                    label=str(_("API version")),
                    required=True,
                    placeholder="2024-10-21",
                ),
            ],
        ),
        ProviderSpec(
            key="ollama",
            label="Ollama",
            model_prefix="ollama/",
            description=str(_("Models running locally via Ollama")),
            supports_model_listing=True,
            docs_url="https://docs.litellm.ai/docs/providers/ollama",
            fields=[
                _api_base_field(
                    required=True,
                    placeholder="http://localhost:11434",
                    help_text=str(_("Where the Ollama server is reachable")),
                ),
            ],
        ),
        ProviderSpec(
            key="groq",
            label="Groq",
            model_prefix="groq/",
            description=str(_("Low-latency inference on Groq hardware")),
            docs_url="https://docs.litellm.ai/docs/providers/groq",
            fields=[_api_key_field()],
        ),
        ProviderSpec(
            key="mistral",
            label="Mistral AI",
            model_prefix="mistral/",
            description=str(_("Mistral and Mixtral models")),
            docs_url="https://docs.litellm.ai/docs/providers/mistral",
            fields=[_api_key_field(), _api_base_field()],
        ),
        ProviderSpec(
            key="deepseek",
            label="DeepSeek",
            model_prefix="deepseek/",
            description=str(_("DeepSeek chat and reasoning models")),
            docs_url="https://docs.litellm.ai/docs/providers/deepseek",
            fields=[_api_key_field()],
        ),
        ProviderSpec(
            key="xai",
            label="xAI",
            model_prefix="xai/",
            description=str(_("Grok models from xAI")),
            docs_url="https://docs.litellm.ai/docs/providers/xai",
            fields=[_api_key_field()],
        ),
        ProviderSpec(
            key="together_ai",
            label="Together AI",
            model_prefix="together_ai/",
            description=str(_("Open models hosted by Together")),
            docs_url="https://docs.litellm.ai/docs/providers/togetherai",
            fields=[_api_key_field()],
        ),
        ProviderSpec(
            key="fireworks_ai",
            label="Fireworks AI",
            model_prefix="fireworks_ai/",
            description=str(_("Open models hosted by Fireworks")),
            docs_url="https://docs.litellm.ai/docs/providers/fireworks_ai",
            fields=[_api_key_field()],
        ),
        ProviderSpec(
            key="cohere",
            label="Cohere",
            model_prefix="cohere/",
            description=str(_("Command models and Cohere embeddings")),
            docs_url="https://docs.litellm.ai/docs/providers/cohere",
            fields=[_api_key_field()],
        ),
        ProviderSpec(
            key="custom",
            label=str(_("Custom / other")),
            model_prefix="",
            description=str(
                _("Any other LiteLLM provider, or a self-hosted OpenAI-compatible API")
            ),
            allows_extra_params=True,
            docs_url="https://docs.litellm.ai/docs/providers",
            fields=[
                ProviderField(
                    name="api_key",
                    label=str(_("API key")),
                    secret=True,
                    field_type="password",
                    help_text=str(_("Leave blank if the endpoint needs no auth")),
                ),
                _api_base_field(
                    help_text=str(_("Base URL of the endpoint, if it needs one")),
                ),
            ],
        ),
    ]
}


class UnknownProviderError(ValueError):
    """Raised when a provider_key has no registered spec."""


def get_spec(provider_key: str) -> ProviderSpec:
    """Look up a spec, raising a typed error rather than KeyError."""
    try:
        return PROVIDER_SPECS[provider_key]
    except KeyError:
        raise UnknownProviderError(
            f"Unknown provider '{provider_key}'. "
            f"Known providers: {', '.join(sorted(PROVIDER_SPECS))}"
        ) from None


def split_params(
    provider_key: str,
    params: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Split submitted params into (plain, secret) by the provider's spec.

    Unknown keys are treated as plain. For ``custom`` that is the whole point -
    arbitrary LiteLLM params pass through. For a preset provider an unknown key
    is a typo or a param the registry has not caught up with; treating it as
    plain keeps it working while ensuring nothing is *wrongly* assumed secret,
    because a field only becomes secret by being declared so.

    Empty values are dropped so a blank optional input does not send
    ``{"api_base": ""}`` to LiteLLM, which some providers reject outright.
    """
    spec = get_spec(provider_key)
    secret_names = spec.secret_field_names

    plain: dict[str, Any] = {}
    secret: dict[str, Any] = {}
    for key, value in params.items():
        if value is None or value == "":
            continue
        if key in secret_names:
            secret[key] = value
        else:
            plain[key] = value
    return plain, secret


def validate_params(provider_key: str, params: dict[str, Any]) -> list[str]:
    """Return human-readable messages for anything missing or unexpected.

    An empty list means valid. Validation is intentionally lenient about extra
    keys - LiteLLM accepts many params this registry does not enumerate, and
    rejecting them would make the ``custom`` escape hatch useless.
    """
    spec = get_spec(provider_key)
    errors: list[str] = []

    for name in sorted(spec.required_field_names):
        value = params.get(name)
        if value is None or value == "":
            label = next(f.label for f in spec.fields if f.name == name)
            errors.append(f"{label} is required for {spec.label}")

    return errors


def build_available_payload() -> list[dict[str, Any]]:
    """Serialize the registry for the provider form.

    Field metadata (label, type, required) drives the UI directly, so adding a
    provider here makes it selectable with no frontend change.
    """
    return [
        {
            "key": spec.key,
            "label": spec.label,
            "description": spec.description,
            "model_prefix": spec.model_prefix,
            "supports_model_listing": spec.supports_model_listing,
            "allows_extra_params": spec.allows_extra_params,
            "docs_url": spec.docs_url,
            "fields": [
                {
                    "name": f.name,
                    "label": f.label,
                    "required": f.required,
                    "secret": f.secret,
                    "type": f.field_type,
                    "placeholder": f.placeholder,
                    "help_text": f.help_text,
                    "default": f.default,
                }
                for f in spec.fields
            ],
        }
        for spec in PROVIDER_SPECS.values()
    ]
