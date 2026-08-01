
from __future__ import annotations

from zobi.mcp_service.utils.sanitization import (
    escape_llm_context_delimiters as escape_llm_context_delimiters,
    sanitize_for_llm_context as sanitize_for_llm_context,
)


def _is_uuid(value: str) -> bool:
    """Check if a string is a valid UUID."""
    import uuid

    try:
        uuid.UUID(value)
        return True
    except ValueError:
        return False
