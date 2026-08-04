"""Validation tests for the gateway's request schemas."""

import pytest
from marshmallow import ValidationError

from zobi.llm.schemas import (
    LLMFallbackEntrySchema,
    LLMModelPostSchema,
    LLMProviderPostSchema,
    LLMProviderPutSchema,
    LLMRouterConfigPutSchema,
)


def test_provider_post_rejects_unknown_provider_key() -> None:
    with pytest.raises(ValidationError) as excinfo:
        LLMProviderPostSchema().load(
            {"name": "x", "provider_key": "nope", "params": {}}
        )
    assert "provider_key" in excinfo.value.messages


def test_provider_post_rejects_missing_required_credentials() -> None:
    with pytest.raises(ValidationError) as excinfo:
        LLMProviderPostSchema().load(
            {"name": "x", "provider_key": "bedrock", "params": {}}
        )
    assert "params" in excinfo.value.messages


def test_provider_post_accepts_a_complete_bedrock_submission() -> None:
    loaded = LLMProviderPostSchema().load(
        {
            "name": "bedrock prod",
            "provider_key": "bedrock",
            "params": {
                "aws_access_key_id": "AKIA",
                "aws_secret_access_key": "secret",
                "aws_region_name": "us-east-1",
            },
        }
    )
    assert loaded["is_active"] is True


def test_provider_put_skips_required_validation() -> None:
    """A partial update need not resend credentials.

    Any secret that was resent arrives masked, so validating it against the
    spec would compare against the placeholder rather than the real value.
    The command validates the merged result instead.
    """
    loaded = LLMProviderPutSchema().load({"name": "renamed"})
    assert loaded == {"name": "renamed"}


def test_model_post_requires_at_least_one_capability() -> None:
    """A model with no capability could never be routed to."""
    with pytest.raises(ValidationError):
        LLMModelPostSchema().load(
            {
                "provider_id": 1,
                "alias": "chat",
                "model_string": "openai/gpt-4o",
                "supports_chat": False,
            }
        )


def test_model_post_defaults_to_chat_only() -> None:
    loaded = LLMModelPostSchema().load(
        {"provider_id": 1, "alias": "chat", "model_string": "openai/gpt-4o"}
    )
    assert loaded["supports_chat"] is True
    assert loaded["supports_embeddings"] is False


def test_model_post_rejects_nonsense_limits() -> None:
    with pytest.raises(ValidationError):
        LLMModelPostSchema().load(
            {
                "provider_id": 1,
                "alias": "chat",
                "model_string": "openai/gpt-4o",
                "rpm": 0,
            }
        )


def test_fallback_entry_rejects_self_reference() -> None:
    """A chain naming its own primary would retry the deployment that failed."""
    with pytest.raises(ValidationError) as excinfo:
        LLMFallbackEntrySchema().load({"primary": "chat", "backups": ["other", "chat"]})
    assert "backups" in excinfo.value.messages


def test_fallback_entry_rejects_duplicate_backups() -> None:
    with pytest.raises(ValidationError):
        LLMFallbackEntrySchema().load({"primary": "chat", "backups": ["a", "a"]})


def test_fallback_entry_requires_at_least_one_backup() -> None:
    with pytest.raises(ValidationError):
        LLMFallbackEntrySchema().load({"primary": "chat", "backups": []})


def test_router_config_rejects_unknown_strategy() -> None:
    with pytest.raises(ValidationError):
        LLMRouterConfigPutSchema().load({"routing_strategy": "round-robin"})


def test_router_config_accepts_every_litellm_strategy() -> None:
    for strategy in (
        "simple-shuffle",
        "least-busy",
        "usage-based-routing",
        "latency-based-routing",
    ):
        loaded = LLMRouterConfigPutSchema().load({"routing_strategy": strategy})
        assert loaded["routing_strategy"] == strategy
