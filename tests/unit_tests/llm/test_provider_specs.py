"""Tests for the provider preset registry.

The registry decides which submitted values are treated as secrets, so a
mistake here is a credential-disclosure bug rather than a cosmetic one. These
tests pin the classification for each credential shape LiteLLM uses.
"""

from typing import Any

import pytest

from zobi.llm.provider_specs import (
    build_available_payload,
    get_spec,
    PROVIDER_SPECS,
    split_params,
    UnknownProviderError,
    validate_params,
)


def test_every_spec_declares_a_key_matching_its_registry_entry() -> None:
    for key, spec in PROVIDER_SPECS.items():
        assert spec.key == key


def test_custom_spec_is_the_escape_hatch() -> None:
    """A provider with no preset must still be reachable."""
    spec = get_spec("custom")
    assert spec.allows_extra_params is True
    assert spec.model_prefix == ""
    # Nothing is required, so an endpoint needing no auth can be configured.
    assert spec.required_field_names == set()


def test_unknown_provider_raises_typed_error() -> None:
    with pytest.raises(UnknownProviderError) as excinfo:
        get_spec("not-a-provider")
    # The message lists valid options, since this surfaces in an API 400.
    assert "openai" in str(excinfo.value)


@pytest.mark.parametrize(
    "provider_key,params,expected_secret_keys",
    [
        (
            "openai",
            {"api_key": "sk-abc", "api_base": "https://example.com"},
            {"api_key"},
        ),
        (
            "bedrock",
            {
                "aws_access_key_id": "AKIA",
                "aws_secret_access_key": "secret",
                "aws_region_name": "us-east-1",
            },
            {"aws_access_key_id", "aws_secret_access_key"},
        ),
        (
            "vertex_ai",
            {
                "vertex_credentials": '{"type": "service_account"}',
                "vertex_project": "my-project",
                "vertex_location": "us-central1",
            },
            {"vertex_credentials"},
        ),
        (
            "azure",
            {
                "api_key": "key",
                "api_base": "https://r.openai.azure.com",
                "api_version": "2024-10-21",
            },
            {"api_key"},
        ),
    ],
)
def test_split_params_classifies_each_credential_shape(
    provider_key: str,
    params: dict[str, Any],
    expected_secret_keys: set[str],
) -> None:
    """Each provider family stores exactly its own secrets, and nothing more."""
    plain, secret = split_params(provider_key, params)

    assert set(secret) == expected_secret_keys
    # Every submitted key lands in exactly one bucket.
    assert set(plain) | set(secret) == set(params)
    assert not set(plain) & set(secret)


def test_split_params_drops_blank_values() -> None:
    """A blank optional input must not become an empty litellm_param.

    Some providers reject an explicit empty api_base outright, so sending
    ``{"api_base": ""}`` would break calls that would otherwise work.
    """
    plain, secret = split_params(
        "bedrock",
        {
            "aws_access_key_id": "AKIA",
            "aws_secret_access_key": "secret",
            "aws_region_name": "us-east-1",
            "aws_role_name": "",
            "aws_session_token": None,
        },
    )
    assert "aws_role_name" not in plain
    assert "aws_session_token" not in secret


def test_split_params_passes_unknown_keys_through_as_plain() -> None:
    """Unknown keys must never be silently assumed secret.

    A field becomes secret only by being declared so; this keeps the custom
    escape hatch usable without risking a plaintext leak of something the
    registry has not caught up with.
    """
    plain, secret = split_params("custom", {"api_key": "k", "some_future_param": "v"})
    assert plain == {"some_future_param": "v"}
    assert secret == {"api_key": "k"}


def test_validate_params_reports_each_missing_required_field() -> None:
    errors = validate_params("vertex_ai", {"vertex_project": "p"})
    assert len(errors) == 2  # credentials JSON and location
    assert all("Vertex" in message or "required" in message for message in errors)


def test_validate_params_accepts_a_complete_submission() -> None:
    assert (
        validate_params(
            "bedrock",
            {
                "aws_access_key_id": "AKIA",
                "aws_secret_access_key": "secret",
                "aws_region_name": "us-east-1",
            },
        )
        == []
    )


def test_available_payload_is_serializable_and_complete() -> None:
    """The frontend renders the form purely from this payload."""
    payload = build_available_payload()

    assert len(payload) == len(PROVIDER_SPECS)
    for entry in payload:
        assert set(entry) >= {"key", "label", "fields", "model_prefix"}
        for field in entry["fields"]:
            assert set(field) >= {"name", "label", "required", "secret", "type"}


def test_providers_the_user_named_are_all_present() -> None:
    """The gateway was specified to cover these by name."""
    for key in (
        "openrouter",
        "openai",
        "anthropic",
        "gemini",
        "vertex_ai",
        "bedrock",
    ):
        assert key in PROVIDER_SPECS
