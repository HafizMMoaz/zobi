"""Tests for provider model-catalogue lookups.

No test here performs a real HTTP request.
"""

from typing import Any

import pytest
from pytest_mock import MockerFixture

from zobi.llm import catalogue
from zobi.llm.provider_specs import PROVIDER_SPECS
from zobi.models.llm import LLMProvider
from zobi.utils import json


def _provider(provider_key: str, **secrets: Any) -> LLMProvider:
    provider = LLMProvider(name=f"p-{provider_key}", provider_key=provider_key)
    provider.params = json.dumps({})
    provider.encrypted_params = json.dumps(secrets)
    return provider


def test_every_listable_provider_has_a_fetcher(app_context: None) -> None:
    """A spec claiming a catalogue must actually have one.

    Without this, flagging a provider as listable silently yields an empty
    dropdown that looks like "this vendor has no models".
    """
    listable = [k for k, v in PROVIDER_SPECS.items() if v.supports_model_listing]

    missing = [k for k in listable if catalogue._fetcher_for(k) is None]  # noqa: SLF001
    assert not missing, f"declared listable but no fetcher: {missing}"


def test_every_fetcher_has_a_listable_spec(app_context: None) -> None:
    """And the reverse: a fetcher nobody can reach is dead code."""
    unflagged = [
        key
        for key in PROVIDER_SPECS
        if catalogue._fetcher_for(key) is not None  # noqa: SLF001
        and not PROVIDER_SPECS[key].supports_model_listing
    ]
    assert not unflagged, f"has a fetcher but not flagged listable: {unflagged}"


def test_openai_shaped_response_is_parsed_and_sorted(
    app_context: None, mocker: MockerFixture
) -> None:
    mocker.patch.object(
        catalogue,
        "_get_json",
        return_value={"data": [{"id": "gpt-4o"}, {"id": "gpt-4o-mini"}]},
    )

    models = catalogue.list_provider_models(_provider("openai", api_key="sk-x"))

    assert models == ["gpt-4o", "gpt-4o-mini"]


def test_anthropic_sends_the_version_header(
    app_context: None, mocker: MockerFixture
) -> None:
    """Anthropic rejects requests without anthropic-version."""
    get_json = mocker.patch.object(
        catalogue, "_get_json", return_value={"data": [{"id": "claude-sonnet-4-5"}]}
    )

    models = catalogue.list_provider_models(_provider("anthropic", api_key="sk-a"))

    assert models == ["claude-sonnet-4-5"]
    headers = get_json.call_args[0][1]
    assert headers["anthropic-version"] == catalogue.ANTHROPIC_VERSION
    assert headers["x-api-key"] == "sk-a"


def test_gemini_strips_the_models_prefix(
    app_context: None, mocker: MockerFixture
) -> None:
    """Gemini returns `models/gemini-2.5-pro`; LiteLLM wants the bare name."""
    mocker.patch.object(
        catalogue,
        "_get_json",
        return_value={"models": [{"name": "models/gemini-2.5-pro"}]},
    )

    models = catalogue.list_provider_models(_provider("gemini", api_key="k"))

    assert models == ["gemini-2.5-pro"]


def test_gemini_authenticates_by_query_string(
    app_context: None, mocker: MockerFixture
) -> None:
    get_json = mocker.patch.object(catalogue, "_get_json", return_value={"models": []})

    catalogue.list_provider_models(_provider("gemini", api_key="secret-key"))

    assert get_json.call_args.kwargs["params"] == {"key": "secret-key"}


def test_ollama_reads_api_tags(app_context: None, mocker: MockerFixture) -> None:
    get_json = mocker.patch.object(
        catalogue, "_get_json", return_value={"models": [{"name": "llama3.3"}]}
    )
    provider = _provider("ollama")
    provider.params = json.dumps({"api_base": "http://localhost:11434"})

    models = catalogue.list_provider_models(provider)

    assert models == ["llama3.3"]
    assert get_json.call_args[0][0].endswith("/api/tags")


def test_a_failing_provider_returns_empty_rather_than_raising(
    app_context: None, mocker: MockerFixture
) -> None:
    """An unreachable catalogue must not block the operator from typing."""
    mocker.patch.object(catalogue, "_get_json", side_effect=Exception("401"))

    assert catalogue.list_provider_models(_provider("openai", api_key="bad")) == []


def test_catalogue_failure_does_not_log_the_key(
    app_context: None,
    mocker: MockerFixture,
    caplog: pytest.LogCaptureFixture,
) -> None:
    mocker.patch.object(catalogue, "_get_json", side_effect=Exception("boom"))

    with caplog.at_level("DEBUG"):
        catalogue.list_provider_models(_provider("openai", api_key="sk-super-secret"))

    assert "sk-super-secret" not in caplog.text


def test_custom_provider_has_no_catalogue(app_context: None) -> None:
    """The escape hatch cannot know where to look, and must not guess."""
    assert catalogue.list_provider_models(_provider("custom", api_key="k")) == []
