"""Helpers for moving provider params between the API and the database."""

from __future__ import annotations

from typing import Any

from zobi.constants import PASSWORD_MASK
from zobi.models.llm import LLMProvider


def merge_masked_params(
    submitted: dict[str, Any],
    provider: LLMProvider,
) -> dict[str, Any]:
    """Replace masked placeholders with the secrets already stored.

    The API hands out ``PASSWORD_MASK`` instead of real secrets, so an admin
    who opens the edit form and saves without retyping their key submits the
    mask back. Writing that through verbatim would replace a working
    credential with the literal string ``XXXXXXXXXX`` - the form would still
    look correct while every call started failing. Substituting here is what
    makes "edit the API base without re-entering the key" work.

    A key the admin actually cleared is absent from ``submitted`` (blank values
    are dropped upstream), so it correctly falls out of the stored secrets.
    """
    stored = provider.encrypted_params_dict
    return {
        key: stored.get(key, value) if value == PASSWORD_MASK else value
        for key, value in submitted.items()
    }
