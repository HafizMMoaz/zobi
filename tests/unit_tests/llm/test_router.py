"""Tests for assembling LiteLLM's ``model_list`` from stored configuration.

These assert on the assembled structure rather than instantiating a Router, so
nothing here touches the network or needs a real provider.
"""

from typing import Any

import pytest
from pytest_mock import MockerFixture
from sqlalchemy.orm.session import Session

from zobi.llm import router as router_module
from zobi.models.llm import LLMModel, LLMProvider, LLMRouterConfig
from zobi.utils import json


@pytest.fixture
def llm_tables(session: Session) -> Session:
    """Create the gateway tables in the in-memory database."""
    LLMProvider.metadata.create_all(session.get_bind())
    router_module.clear_router_cache()
    return session


def _add_provider(
    session: Session,
    name: str = "provider",
    provider_key: str = "openai",
    params: dict[str, Any] | None = None,
    secrets: dict[str, Any] | None = None,
) -> LLMProvider:
    provider = LLMProvider(
        name=name,
        provider_key=provider_key,
        params=json.dumps(params or {}),
        encrypted_params=json.dumps(secrets or {}),
        is_active=True,
    )
    session.add(provider)
    session.flush()
    return provider


def _add_model(
    session: Session,
    provider: LLMProvider,
    alias: str,
    model_string: str,
    **kwargs: Any,
) -> LLMModel:
    model = LLMModel(
        provider_id=provider.id,
        alias=alias,
        model_string=model_string,
        supports_chat=kwargs.pop("supports_chat", True),
        is_active=kwargs.pop("is_active", True),
        extra_params=json.dumps(kwargs.pop("extra_params", {})),
        **kwargs,
    )
    session.add(model)
    session.flush()
    return model


def test_bedrock_credentials_reach_litellm_params(llm_tables: Session) -> None:
    """AWS credentials must arrive under the keys LiteLLM expects."""
    provider = _add_provider(
        llm_tables,
        provider_key="bedrock",
        params={"aws_region_name": "us-east-1"},
        secrets={"aws_access_key_id": "AKIA", "aws_secret_access_key": "shh"},
    )
    _add_model(llm_tables, provider, "claude", "bedrock/anthropic.claude-3-5-sonnet")

    [deployment] = router_module.build_model_list()

    assert deployment["litellm_params"]["aws_region_name"] == "us-east-1"
    assert deployment["litellm_params"]["aws_access_key_id"] == "AKIA"
    assert deployment["litellm_params"]["aws_secret_access_key"] == "shh"  # noqa: S105


def test_vertex_credentials_reach_litellm_params(llm_tables: Session) -> None:
    """Vertex passes a whole service-account JSON string, not an api_key."""
    provider = _add_provider(
        llm_tables,
        provider_key="vertex_ai",
        params={"vertex_project": "proj", "vertex_location": "us-central1"},
        secrets={"vertex_credentials": '{"type": "service_account"}'},
    )
    _add_model(llm_tables, provider, "gemini", "vertex_ai/gemini-2.5-pro")

    [deployment] = router_module.build_model_list()
    params = deployment["litellm_params"]

    assert params["vertex_project"] == "proj"
    assert params["vertex_location"] == "us-central1"
    assert params["vertex_credentials"] == '{"type": "service_account"}'


def test_shared_alias_produces_a_load_balanced_pool(llm_tables: Session) -> None:
    """Two deployments under one alias is how load balancing is expressed."""
    openrouter = _add_provider(
        llm_tables,
        name="openrouter",
        provider_key="openrouter",
        secrets={"api_key": "or-key"},
    )
    anthropic = _add_provider(
        llm_tables,
        name="anthropic",
        provider_key="anthropic",
        secrets={"api_key": "an-key"},
    )
    _add_model(llm_tables, openrouter, "chat", "openrouter/anthropic/claude")
    _add_model(llm_tables, anthropic, "chat", "anthropic/claude-sonnet-4-5")

    model_list = router_module.build_model_list()

    assert [d["model_name"] for d in model_list] == ["chat", "chat"]
    # Distinct ids so LiteLLM can track cooldowns per deployment.
    ids = {d["model_info"]["id"] for d in model_list}
    assert len(ids) == 2


def test_limits_are_omitted_when_unset(llm_tables: Session) -> None:
    """Passing None would read as configured-but-zero to LiteLLM."""
    provider = _add_provider(llm_tables, secrets={"api_key": "k"})
    _add_model(llm_tables, provider, "chat", "openai/gpt-4o")

    [deployment] = router_module.build_model_list()

    for key in ("tpm", "rpm", "max_parallel_requests", "max_budget"):
        assert key not in deployment["litellm_params"]


def test_limits_are_passed_when_set(llm_tables: Session) -> None:
    provider = _add_provider(llm_tables, secrets={"api_key": "k"})
    _add_model(
        llm_tables,
        provider,
        "chat",
        "openai/gpt-4o",
        tpm=40000,
        rpm=500,
        max_parallel_requests=10,
    )

    [deployment] = router_module.build_model_list()

    assert deployment["litellm_params"]["tpm"] == 40000
    assert deployment["litellm_params"]["rpm"] == 500
    assert deployment["litellm_params"]["max_parallel_requests"] == 10


def test_model_extra_params_override_provider_params(llm_tables: Session) -> None:
    """A model may override an inherited setting, but never its own model string."""
    provider = _add_provider(
        llm_tables,
        params={"api_base": "https://shared.example.com"},
        secrets={"api_key": "k"},
    )
    _add_model(
        llm_tables,
        provider,
        "chat",
        "openai/gpt-4o",
        extra_params={
            "api_base": "https://override.example.com",
            "temperature": 0.2,
        },
    )

    [deployment] = router_module.build_model_list()

    assert deployment["litellm_params"]["api_base"] == "https://override.example.com"
    assert deployment["litellm_params"]["temperature"] == 0.2
    assert deployment["litellm_params"]["model"] == "openai/gpt-4o"


def test_inactive_models_and_providers_are_excluded(llm_tables: Session) -> None:
    active = _add_provider(llm_tables, name="active", secrets={"api_key": "k"})
    disabled = _add_provider(llm_tables, name="disabled", secrets={"api_key": "k"})
    disabled.is_active = False

    _add_model(llm_tables, active, "chat", "openai/gpt-4o")
    _add_model(llm_tables, active, "off", "openai/gpt-4o-mini", is_active=False)
    _add_model(llm_tables, disabled, "orphan", "openai/gpt-4o")
    llm_tables.flush()

    assert [d["model_name"] for d in router_module.build_model_list()] == ["chat"]


def test_build_router_refuses_when_nothing_is_configured(
    llm_tables: Session,
) -> None:
    with pytest.raises(router_module.NoModelsConfiguredError):
        router_module.build_router()


def test_router_kwargs_omit_unset_settings(llm_tables: Session) -> None:
    """Unset settings must fall through to LiteLLM's own defaults."""
    config = LLMRouterConfig(id=1, routing_strategy="least-busy", num_retries=3)
    llm_tables.add(config)
    llm_tables.flush()

    kwargs = router_module._router_kwargs(config)  # noqa: SLF001

    assert kwargs["routing_strategy"] == "least-busy"
    assert kwargs["num_retries"] == 3
    assert "timeout" not in kwargs
    assert "cooldown_time" not in kwargs
    assert "fallbacks" not in kwargs


def test_router_kwargs_pass_fallbacks_in_litellm_shape(
    llm_tables: Session,
) -> None:
    config = LLMRouterConfig(
        id=1,
        routing_strategy="simple-shuffle",
        fallbacks=json.dumps([{"chat": ["backup"]}]),
    )
    llm_tables.add(config)
    llm_tables.flush()

    kwargs = router_module._router_kwargs(config)  # noqa: SLF001

    assert kwargs["fallbacks"] == [{"chat": ["backup"]}]


def test_router_cache_rebuilds_when_configuration_changes(
    llm_tables: Session,
    mocker: MockerFixture,
) -> None:
    """The stamp is read from the database so every worker sees an edit."""
    provider = _add_provider(llm_tables, secrets={"api_key": "k"})
    _add_model(llm_tables, provider, "chat", "openai/gpt-4o")

    build = mocker.patch.object(
        router_module, "build_router", side_effect=["first", "second"]
    )

    assert router_module.get_router() == "first"
    # Unchanged configuration serves from cache.
    assert router_module.get_router() == "first"
    assert build.call_count == 1

    _add_model(llm_tables, provider, "chat2", "openai/gpt-4o-mini")

    assert router_module.get_router() == "second"
    assert build.call_count == 2


def test_referenced_aliases_covers_defaults_and_fallback_chains() -> None:
    """What must not be left dangling when a model is deleted."""
    config = LLMRouterConfig(
        id=1,
        default_chat_alias="chat",
        default_embedding_alias="embed",
        fallbacks=json.dumps([{"chat": ["backup-a", "backup-b"]}]),
    )

    assert config.referenced_aliases() == {
        "chat",
        "embed",
        "backup-a",
        "backup-b",
    }
