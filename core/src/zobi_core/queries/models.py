"""
Query model API for core.

Provides query-related model classes that will be replaced by host implementations
during initialization for extension developers to use.

Usage:
    from zobi_core.queries.models import Query, SavedQuery
"""

from __future__ import annotations

from uuid import UUID

from zobi_core.common.models import CoreModel


class Query(CoreModel):
    """
    Abstract Query model interface.

    Host implementations will replace this class during initialization
    with concrete implementation providing actual functionality.
    """

    __abstract__ = True

    # Type hints for expected attributes (no actual field definitions)
    id: int
    client_id: str | None
    database_id: int | None
    sql: str | None
    status: str | None
    user_id: int | None
    progress: int
    error_message: str | None


class SavedQuery(CoreModel):
    """
    Abstract SavedQuery model interface.

    Host implementations will replace this class during initialization
    with concrete implementation providing actual functionality.
    """

    __abstract__ = True

    # Type hints for expected attributes (no actual field definitions)
    id: int
    uuid: UUID | None
    label: str | None
    sql: str | None
    database_id: int | None
    description: str | None
    user_id: int | None


__all__ = [
    "Query",
    "SavedQuery",
]
