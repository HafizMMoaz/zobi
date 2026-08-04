"""Tests for the gateway's public entry points.

Every LiteLLM call is mocked; nothing here reaches a provider.
"""

import pytest
from pytest_mock import MockerFixture
from sqlalchemy.orm.session import Session

from zobi.llm import router as router_module, service
from zobi.models.llm import LLMModel, LLMProvider, LLMRouterConfig
from zobi.utils import json


@pytest.fixture
def llm_tables(session: Session) -> Session:
    LLMProvider.metadata.create_all(session.get_bind())
    router_module.clear_router_cache()
    return session


def _seed_model(
    session: Session,
    alias: str,
    *,
    chat: bool = True,
    transcription: bool = False,
) -> LLMModel:
    provider = LLMProvider(
        name=f"provider-{alias}",
        provider_key="openai",
        params=json.dumps({}),
        encrypted_params=json.dumps({"api_key": "k"}),
        is_active=True,
    )
    session.add(provider)
    session.flush()

    model = LLMModel(
        provider_id=provider.id,
        alias=alias,
        model_string="openai/gpt-4o",
        supports_chat=chat,
        supports_transcription=transcription,
        is_active=True,
        extra_params=json.dumps({}),
    )
    session.add(model)
    session.flush()
    return model


def test_explicit_alias_wins(llm_tables: Session) -> None:
    _seed_model(llm_tables, "configured-default")
    config = LLMRouterConfig(id=1, default_chat_alias="configured-default")
    llm_tables.add(config)
    llm_tables.flush()

    assert service.resolve_alias("chat", "explicit") == "explicit"


def test_configured_default_is_used_when_no_alias_given(
    llm_tables: Session,
) -> None:
    _seed_model(llm_tables, "chosen")
    _seed_model(llm_tables, "other")
    llm_tables.add(LLMRouterConfig(id=1, default_chat_alias="chosen"))
    llm_tables.flush()

    assert service.resolve_alias("chat") == "chosen"


def test_falls_back_to_any_capable_model_when_no_default_is_set(
    llm_tables: Session,
) -> None:
    """A fresh install works after adding one model, with no routing setup."""
    _seed_model(llm_tables, "only-one")
    llm_tables.add(LLMRouterConfig(id=1))
    llm_tables.flush()

    assert service.resolve_alias("chat") == "only-one"


def test_capability_is_respected_when_falling_back(llm_tables: Session) -> None:
    """A chat-only model must not be handed a transcription request."""
    _seed_model(llm_tables, "chat-only", chat=True, transcription=False)
    _seed_model(llm_tables, "whisper", chat=False, transcription=True)
    llm_tables.add(LLMRouterConfig(id=1))
    llm_tables.flush()

    assert service.resolve_alias("transcription") == "whisper"


def test_missing_capability_raises_a_directing_error(llm_tables: Session) -> None:
    _seed_model(llm_tables, "chat-only")
    llm_tables.add(LLMRouterConfig(id=1))
    llm_tables.flush()

    with pytest.raises(service.NoModelForCapabilityError) as excinfo:
        service.resolve_alias("embeddings")
    assert "AI Models" in str(excinfo.value)


def test_unknown_capability_is_a_programming_error(llm_tables: Session) -> None:
    llm_tables.add(LLMRouterConfig(id=1))
    llm_tables.flush()

    with pytest.raises(ValueError, match="Unknown capability"):
        service.resolve_alias("telepathy")


def test_chat_completion_passes_kwargs_through(
    llm_tables: Session,
    mocker: MockerFixture,
) -> None:
    """Tools, temperature and the rest must reach LiteLLM untouched."""
    _seed_model(llm_tables, "chat")
    llm_tables.add(LLMRouterConfig(id=1, default_chat_alias="chat"))
    llm_tables.flush()

    fake_router = mocker.Mock()
    mocker.patch.object(service, "get_router", return_value=fake_router)

    messages = [{"role": "user", "content": "hi"}]
    service.chat_completion(messages, temperature=0.2, tools=["a"])

    fake_router.completion.assert_called_once_with(
        model="chat",
        messages=messages,
        stream=False,
        temperature=0.2,
        tools=["a"],
    )


def test_test_credentials_qualifies_a_bare_model_string(
    mocker: MockerFixture,
) -> None:
    """Pasting a bare vendor model name is the commonest setup mistake."""
    completion = mocker.patch("litellm.completion")

    ok, error = service.test_credentials(
        "anthropic", {"api_key": "sk-test"}, "claude-sonnet-4-5"
    )

    assert ok is True
    assert error is None
    assert completion.call_args.kwargs["model"] == "anthropic/claude-sonnet-4-5"
    assert completion.call_args.kwargs["api_key"] == "sk-test"


def test_test_credentials_leaves_a_qualified_string_alone(
    mocker: MockerFixture,
) -> None:
    completion = mocker.patch("litellm.completion")

    service.test_credentials(
        "anthropic", {"api_key": "k"}, "anthropic/claude-sonnet-4-5"
    )

    assert completion.call_args.kwargs["model"] == "anthropic/claude-sonnet-4-5"


def test_test_credentials_reports_failures_instead_of_raising(
    mocker: MockerFixture,
) -> None:
    """Every failure mode here is something to show in the form, not a 500."""
    mocker.patch("litellm.completion", side_effect=Exception("bad key"))

    ok, error = service.test_credentials("openai", {"api_key": "no"}, "gpt-4o")

    assert ok is False
    assert "bad key" in error


def test_test_credentials_does_not_log_the_secret(
    mocker: MockerFixture,
    caplog: pytest.LogCaptureFixture,
) -> None:
    mocker.patch("litellm.completion", side_effect=Exception("boom"))

    with caplog.at_level("DEBUG"):
        service.test_credentials("openai", {"api_key": "sk-super-secret"}, "gpt-4o")

    assert "sk-super-secret" not in caplog.text
