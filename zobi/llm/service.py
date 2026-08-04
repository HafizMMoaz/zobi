"""The public face of the LLM gateway.

Everything else in Zobi - the chat runtime, voice input, any future retrieval -
should import from this module and nothing deeper. Keeping the surface this
narrow means provider storage, Router assembly and LiteLLM itself can all
change without touching callers.
"""

from __future__ import annotations

import logging
from typing import Any, BinaryIO

from zobi.extensions import db
from zobi.llm.provider_specs import get_spec, split_params
from zobi.llm.router import (
    get_router,
    get_router_config,
    NoModelsConfiguredError,
)
from zobi.models.llm import LLMModel, LLMProvider

logger = logging.getLogger(__name__)

#: Capability name -> (model column, config column holding the default alias)
_CAPABILITIES = {
    "chat": ("supports_chat", "default_chat_alias"),
    "transcription": ("supports_transcription", "default_transcription_alias"),
    "embeddings": ("supports_embeddings", "default_embedding_alias"),
}


class NoModelForCapabilityError(Exception):
    """Raised when nothing configured can serve the requested capability."""


def resolve_alias(capability: str, alias: str | None = None) -> str:
    """Pick which Router alias serves a call.

    Resolution order: an explicit alias wins; then the configured default for
    that capability; then any active model declaring it. The last step means a
    fresh install works after adding one model, without also having to visit
    the routing settings.

    An explicit alias is returned unchecked - LiteLLM raises a clear error for
    an unknown model, and re-validating here would cost a query per call.
    """
    if alias:
        return alias

    try:
        column_name, config_attr = _CAPABILITIES[capability]
    except KeyError:
        raise ValueError(f"Unknown capability '{capability}'") from None

    if configured := getattr(get_router_config(), config_attr):
        return configured

    fallback = (
        db.session.query(LLMModel.alias)
        .join(LLMProvider)
        .filter(
            getattr(LLMModel, column_name).is_(True),
            LLMModel.is_active.is_(True),
            LLMProvider.is_active.is_(True),
        )
        .first()
    )
    if fallback is None:
        raise NoModelForCapabilityError(
            f"No active model supports '{capability}'. "
            f"Configure one under Manage > AI Models."
        )
    return fallback[0]


def chat_completion(
    messages: list[dict[str, Any]],
    alias: str | None = None,
    stream: bool = False,
    **kwargs: Any,
) -> Any:
    """Run a chat completion through the Router.

    Returns LiteLLM's OpenAI-shaped response, or a streaming iterator when
    ``stream`` is set. ``kwargs`` passes through to LiteLLM untouched, so
    tools, temperature, response_format and the rest are all available.
    """
    router = get_router()
    return router.completion(
        model=resolve_alias("chat", alias),
        messages=messages,
        stream=stream,
        **kwargs,
    )


async def achat_completion(
    messages: list[dict[str, Any]],
    alias: str | None = None,
    stream: bool = False,
    **kwargs: Any,
) -> Any:
    """Async counterpart to :func:`chat_completion`.

    The chat runtime streams over websockets, so it needs the async path;
    exposing both here keeps callers off ``router`` directly.
    """
    router = get_router()
    return await router.acompletion(
        model=resolve_alias("chat", alias),
        messages=messages,
        stream=stream,
        **kwargs,
    )


def transcribe(audio_file: BinaryIO, alias: str | None = None, **kwargs: Any) -> Any:
    """Transcribe audio using a model that declares the transcription capability."""
    router = get_router()
    return router.transcription(
        model=resolve_alias("transcription", alias),
        file=audio_file,
        **kwargs,
    )


def embed(texts: list[str], alias: str | None = None, **kwargs: Any) -> Any:
    """Embed one or more strings."""
    router = get_router()
    return router.embedding(
        model=resolve_alias("embeddings", alias),
        input=texts,
        **kwargs,
    )


def test_credentials(
    provider_key: str,
    params: dict[str, Any],
    model_string: str,
) -> tuple[bool, str | None]:
    """Try one minimal completion against unsaved credentials.

    Bypasses the Router deliberately: this runs before a provider exists in the
    database, and must not disturb the cached Router or its cooldown state.

    Returns ``(ok, error_message)``. Exceptions become messages rather than
    propagating, because every failure mode here - bad key, wrong region,
    unreachable host, model not enabled on the account - is something the admin
    needs shown in the form, not a 500.
    """
    from litellm import completion  # noqa: PLC0415

    spec = get_spec(provider_key)
    plain, secret = split_params(provider_key, params)

    if spec.model_prefix and not model_string.startswith(spec.model_prefix):
        model_string = f"{spec.model_prefix}{model_string}"

    try:
        completion(
            model=model_string,
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=1,
            **plain,
            **secret,
        )
    except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
        # Log the type and provider only. The message can echo request context,
        # and the params in scope here include decrypted secrets.
        logger.warning(
            "LLM credential test failed for provider_key=%s: %s",
            provider_key,
            type(ex).__name__,
        )
        return False, str(ex)

    return True, None


__all__ = [
    "achat_completion",
    "chat_completion",
    "embed",
    "NoModelForCapabilityError",
    "NoModelsConfiguredError",
    "resolve_alias",
    "test_credentials",
    "transcribe",
]
