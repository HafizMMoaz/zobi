"""Tests for the secret round-trip.

The invariant under test: a real credential must never leave the server, and
an admin who saves the form without retyping a secret must not destroy it.
"""

from zobi.constants import PASSWORD_MASK
from zobi.llm.utils import merge_masked_params
from zobi.models.llm import LLMProvider
from zobi.utils import json


def _provider(**secrets: str) -> LLMProvider:
    """A provider carrying secrets, without touching the database.

    ``encrypted_params`` is assigned as plain JSON here; encryption happens in
    the column type at flush time, which these tests do not exercise.
    """
    provider = LLMProvider(name="test", provider_key="openai")
    provider.params = json.dumps({"api_base": "https://example.com"})
    provider.encrypted_params = json.dumps(secrets)
    return provider


def test_public_params_never_expose_a_secret_value() -> None:
    provider = _provider(api_key="sk-real-secret-value")

    public = provider.public_params

    assert public["api_key"] == PASSWORD_MASK
    assert "sk-real-secret-value" not in json.dumps(public)
    # Non-secret params stay readable so the form can show them.
    assert public["api_base"] == "https://example.com"


def test_public_params_keep_secret_keys_so_the_form_knows_what_is_set() -> None:
    provider = _provider(api_key="sk-real", aws_session_token="tok")  # noqa: S106

    assert set(provider.public_params) == {
        "api_base",
        "api_key",
        "aws_session_token",
    }


def test_saving_without_retyping_preserves_the_stored_secret() -> None:
    """The regression this masking exists to prevent.

    Writing the mask through verbatim would replace a working key with the
    literal string "XXXXXXXXXX" - the form would still look right while every
    call started failing.
    """
    provider = _provider(api_key="sk-real-secret-value")

    merged = merge_masked_params(
        {"api_key": PASSWORD_MASK, "api_base": "https://changed.example.com"},
        provider,
    )

    assert merged["api_key"] == "sk-real-secret-value"
    assert merged["api_base"] == "https://changed.example.com"


def test_retyping_a_secret_replaces_it() -> None:
    provider = _provider(api_key="sk-old")

    merged = merge_masked_params({"api_key": "sk-new"}, provider)

    assert merged["api_key"] == "sk-new"


def test_clearing_a_secret_drops_it() -> None:
    """A key absent from the submission falls out of storage.

    Blank values are dropped upstream by ``split_params``, so "cleared"
    reaches this function as an absent key rather than an empty string.
    """
    provider = _provider(api_key="sk-old", aws_session_token="tok")  # noqa: S106

    merged = merge_masked_params({"api_key": PASSWORD_MASK}, provider)

    assert merged == {"api_key": "sk-old"}
    assert "aws_session_token" not in merged


def test_mask_substitution_only_applies_to_stored_keys() -> None:
    """A mask for a key that was never stored is not resurrected from nowhere."""
    provider = _provider(api_key="sk-real")

    merged = merge_masked_params(
        {"api_key": PASSWORD_MASK, "never_stored": PASSWORD_MASK}, provider
    )

    assert merged["api_key"] == "sk-real"
    # Nothing to restore, so the placeholder is left as-is for validation to
    # reject rather than being silently invented.
    assert merged["never_stored"] == PASSWORD_MASK
