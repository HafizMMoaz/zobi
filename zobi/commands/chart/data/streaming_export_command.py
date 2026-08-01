"""Command for streaming CSV exports of chart data."""

from __future__ import annotations

from typing import Any, TYPE_CHECKING

from zobi.commands.streaming_export.base import BaseStreamingCSVExportCommand

if TYPE_CHECKING:
    from zobi.common.query_context import QueryContext


class StreamingCSVExportCommand(BaseStreamingCSVExportCommand):
    """
    Command to execute a streaming CSV export for chart data.

    This command handles chart-specific logic:
    - QueryContext validation
    - Datasource preparation and SQL generation
    - No row limit (exports all chart data)
    """

    def __init__(
        self,
        query_context: QueryContext,
        chunk_size: int = 1000,
    ):
        """
        Initialize the chart streaming export command.

        Args:
            query_context: The query context containing datasource and query details
            chunk_size: Number of rows to fetch per database query (default: 1000)
        """
        super().__init__(chunk_size)
        self._query_context = query_context

    def validate(self) -> None:
        """Validate permissions and query context."""
        self._query_context.raise_for_access()

    def _get_sql_and_database(self) -> tuple[str, Any, str | None, str | None]:
        """
        Get the SQL query, database, catalog, and schema for chart export.

        Returns:
            Tuple of (sql_query, database_object, catalog, schema)
        """
        # Get datasource and generate SQL query
        # Note: datasource should already be attached to a session from query_context
        datasource = self._query_context.datasource
        query_obj = self._query_context.queries[0]
        sql_query = datasource.get_query_str(query_obj.to_dict())
        database = getattr(datasource, "database", None)
        catalog = getattr(datasource, "catalog", None)
        schema = getattr(datasource, "schema", None)

        return sql_query, database, catalog, schema

    def _get_row_limit(self) -> int | None:
        """
        Get the row limit for chart export.

        Returns:
            None (no limit for chart exports)
        """
        return None
