"""Fetches the model catalogue from providers that publish one.

Most vendors expose an OpenAI-shaped ``GET /models`` returning
``{"data": [{"id": ...}]}``, so one fetcher covers them once you know the base
URL. Anthropic, Gemini and Ollama each differ enough to need their own.

Every failure here is non-fatal by design. A catalogue is a convenience that
saves the operator typing a model string; an unreachable or unauthorised
endpoint must never block them from typing it themselves. Callers get an empty
list and the UI falls back to free text.
"""

from __future__ import annotations

import logging
from typing import Any, Callable

import requests

from zobi.llm.provider_specs import get_spec, UnknownProviderError
from zobi.models.llm import LLMProvider

logger = logging.getLogger(__name__)

#: Catalogue lookups are a convenience, so fail fast rather than making the
#: operator wait on a slow or wedged provider.
FETCH_TIMEOUT_SECONDS = 8

#: Default API roots for providers that speak the OpenAI ``/models`` shape.
#: A provider's own ``api_base`` always wins when one is configured.
OPENAI_COMPATIBLE_BASES = {
    "openai": "https://api.openai.com/v1",
    "openrouter": "https://openrouter.ai/api/v1",
    "groq": "https://api.groq.com/openai/v1",
    "mistral": "https://api.mistral.ai/v1",
    "deepseek": "https://api.deepseek.com",
    "xai": "https://api.x.ai/v1",
    "together_ai": "https://api.together.xyz/v1",
    "fireworks_ai": "https://api.fireworks.ai/inference/v1",
}

ANTHROPIC_BASE = "https://api.anthropic.com/v1"
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"
#: Anthropic requires an explicit version header on every request.
ANTHROPIC_VERSION = "2023-06-01"


def _get_json(
    url: str,
    headers: dict[str, str] | None = None,
    params: dict[str, str] | None = None,
) -> Any:
    response = requests.get(
        url,
        headers=headers or {},
        params=params or {},
        timeout=FETCH_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()


def _openai_compatible(provider_key: str, credentials: dict[str, Any]) -> list[str]:
    """Read ``{"data": [{"id": ...}]}`` from an OpenAI-shaped endpoint."""
    base = credentials.get("api_base") or OPENAI_COMPATIBLE_BASES[provider_key]
    api_key = credentials.get("api_key")
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
    payload = _get_json(f"{base.rstrip('/')}/models", headers)
    return sorted(
        item["id"]
        for item in payload.get("data", [])
        if isinstance(item, dict) and item.get("id")
    )


def _fetch_anthropic(credentials: dict[str, Any]) -> list[str]:
    """Anthropic uses x-api-key plus a version header, but an OpenAI-ish body."""
    base = credentials.get("api_base") or ANTHROPIC_BASE
    payload = _get_json(
        f"{base.rstrip('/')}/models",
        {
            "x-api-key": credentials.get("api_key", ""),
            "anthropic-version": ANTHROPIC_VERSION,
        },
    )
    return sorted(
        item["id"]
        for item in payload.get("data", [])
        if isinstance(item, dict) and item.get("id")
    )


def _fetch_gemini(credentials: dict[str, Any]) -> list[str]:
    """Gemini authenticates by query string and returns ``models/<name>``.

    The prefix is stripped so the value matches what LiteLLM expects after its
    own ``gemini/`` namespace.
    """
    base = credentials.get("api_base") or GEMINI_BASE
    payload = _get_json(
        f"{base.rstrip('/')}/models",
        params={"key": credentials.get("api_key", "")},
    )
    names = []
    for item in payload.get("models", []):
        if not isinstance(item, dict) or not item.get("name"):
            continue
        names.append(item["name"].removeprefix("models/"))
    return sorted(names)


def _fetch_ollama(credentials: dict[str, Any]) -> list[str]:
    """Ollama uses ``/api/tags`` with a ``models`` array keyed on ``name``."""
    base = credentials.get("api_base")
    if not base:
        return []
    payload = _get_json(f"{base.rstrip('/')}/api/tags")
    return sorted(
        item["name"]
        for item in payload.get("models", [])
        if isinstance(item, dict) and item.get("name")
    )


def _fetcher_for(provider_key: str) -> Callable[[dict[str, Any]], list[str]] | None:
    if provider_key in OPENAI_COMPATIBLE_BASES:
        return lambda creds: _openai_compatible(provider_key, creds)
    return {
        "anthropic": _fetch_anthropic,
        "gemini": _fetch_gemini,
        "ollama": _fetch_ollama,
    }.get(provider_key)


def list_provider_models(provider: LLMProvider) -> list[str]:
    """Model identifiers this provider reports, or ``[]`` if it cannot say.

    Identifiers come back exactly as the vendor names them, without LiteLLM's
    namespace prefix. ``CreateLLMModelCommand`` adds that prefix on save, so
    the UI can show the vendor's own naming without translating it here.
    """
    try:
        spec = get_spec(provider.provider_key)
    except UnknownProviderError:
        return []

    if not spec.supports_model_listing:
        return []

    fetcher = _fetcher_for(provider.provider_key)
    if fetcher is None:
        return []

    try:
        return fetcher(provider.credentials())
    except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
        # Type only: the message can echo request context, and the credentials
        # in scope include the decrypted API key.
        logger.warning(
            "Could not list models for provider %s (%s): %s",
            provider.id,
            provider.provider_key,
            type(ex).__name__,
        )
        return []
