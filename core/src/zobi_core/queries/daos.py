"""
Query Data Access Object API for core.

Provides query-related DAO classes that will be replaced by host implementations
during initialization.

Usage:
    from zobi_core.queries.daos import QueryDAO, SavedQueryDAO
"""

from zobi_core.common.daos import BaseDAO
from zobi_core.queries.models import Query, SavedQuery


class QueryDAO(BaseDAO[Query]):
    """
    Abstract Query DAO interface.

    Host implementations will replace this class during initialization
    with a concrete implementation providing actual functionality.
    """

    # Class variables that will be set by host implementation
    model_cls = None
    base_filter = None
    id_column_name = "id"


class SavedQueryDAO(BaseDAO[SavedQuery]):
    """
    Abstract SavedQuery DAO interface.

    Host implementations will replace this class during initialization
    with a concrete implementation providing actual functionality.
    """

    # Class variables that will be set by host implementation
    model_cls = None
    base_filter = None
    id_column_name = "id"


__all__ = [
    "QueryDAO",
    "SavedQueryDAO",
]
