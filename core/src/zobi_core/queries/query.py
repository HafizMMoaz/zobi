"""
Query API for core.

Provides dependency-injected query utility functions that will be replaced by
host implementations during initialization.

Usage:
    from zobi_core.queries.query import get_sqlglot_dialect

    dialect = get_sqlglot_dialect(database)
"""

from typing import TYPE_CHECKING

from sqlglot import Dialects

if TYPE_CHECKING:
    from zobi_core.common.models import Database


def get_sqlglot_dialect(database: "Database") -> Dialects:
    """
    Get the SQLGlot dialect for the specified database.

    Host implementations will replace this function during initialization
    with a concrete implementation providing actual functionality.

    :param database: The database instance to get the dialect for.
    :returns: The SQLGlot dialect enum corresponding to the database.
    """
    raise NotImplementedError("Function will be replaced during initialization")


__all__ = ["get_sqlglot_dialect"]
