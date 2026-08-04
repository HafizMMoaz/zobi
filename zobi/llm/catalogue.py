"""Fetches the model catalogue from providers that publish one.

Only a minority of providers expose a listable catalogue, and the ones that do
disagree on the endpoint and payload shape. This module normalises the three
worth supporting and returns an empty list for everything else - the form falls
back to a free-text model string, which always works.

Every failure here is non-fatal by design: a catalogue is a convenience, and an
unreachable one must never block an admin from typing the model name.
"""

from __future__ import annotations

import logging
from typing import Any, Callable

import requests

from zobi.llm.provider_specs import get_spec, UnknownProviderError
from zobi.models.llm import LLMProvider

logger = logging.getLogger(__name__)

#: Catalogue endpoints are a convenience, so fail fast rather than making the
#: admin wait on a slow or wedged provider.
FETCH_TIMEOUT_SECONDS = 8

OPENAI_DEFAULT_BASE = "https://api.openai.com/v1"
OPENROUTER_DEFAULT_BASE = "https://openrouter.ai/api/v1"


def _get_json(url: str, headers: dict[str, str] | None = None) -> Any:
    response = requests.get(
        url,
        headers=headers or {},
        timeout=FETCH_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()


def _openai_compatible_models(base: str, api_key: str | None) -> list[str]:
    """Read an OpenAI-shaped ``/models`` response: ``{"data": [{"id": ...}]}``."""
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
    payload = _get_json(f"{base.rstrip('/')}/models", headers)
    return sorted(
        item["id"] for item in payload.get("data", []) if isinstance(item, dict)
    )


def _fetch_openai(credentials: dict[str, Any]) -> list[str]:
    base = credentials.get("api_base") or OPENAI_DEFAULT_BASE
    return _openai_compatible_models(base, credentials.get("api_key"))


def _fetch_openrouter(credentials: dict[str, Any]) -> list[str]:
    base = credentials.get("api_base") or OPENROUTER_DEFAULT_BASE
    return _openai_compatible_models(base, credentials.get("api_key"))


def _fetch_ollama(credentials: dict[str, Any]) -> list[str]:
    """Ollama uses ``/api/tags`` with a ``models`` array keyed on ``name``."""
    base = credentials.get("api_base")
    if not base:
        return []
    payload = _get_json(f"{base.rstrip('/')}/api/tags")
    return sorted(
        item["name"] for item in payload.get("models", []) if isinstance(item, dict)
    )


_FETCHERS: dict[str, Callable[[dict[str, Any]], list[str]]] = {
    "openai": _fetch_openai,
    "openrouter": _fetch_openrouter,
    "ollama": _fetch_ollama,
}


def list_provider_models(provider: LLMProvider) -> list[str]:
    """Model identifiers this provider reports, or ``[]`` if it cannot say.

    Returned identifiers are unprefixed, exactly as the vendor reports them.
    ``CreateLLMModelCommand`` adds the LiteLLM namespace prefix on save, so the
    UI can show the vendor's own naming without translating it here.
    """
    try:
        spec = get_spec(provider.provider_key)
    except UnknownProviderError:
        return []

    if not spec.supports_model_listing:
        return []

    fetcher = _FETCHERS.get(provider.provider_key)
    if fetcher is None:
        return []

    try:
        return fetcher(provider.credentials())
    except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
        # Type only: the message can echo the request, including the auth header.
        logger.warning(
            "Could not list models for provider %s (%s): %s",
            provider.id,
            provider.provider_key,
            type(ex).__name__,
        )
        return []
