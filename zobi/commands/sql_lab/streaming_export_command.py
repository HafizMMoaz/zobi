"""Command for streaming CSV exports of SQL Lab query results."""

from __future__ import annotations

from typing import Any

from flask_babel import gettext as __

from zobi import db
from zobi.commands.streaming_export.base import BaseStreamingCSVExportCommand
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType
from zobi.exceptions import ZobiErrorException, ZobiSecurityException
from zobi.models.sql_lab import Query
from zobi.sql.parse import SQLScript
from zobi.sqllab.limiting_factor import LimitingFactor


class StreamingSqlResultExportCommand(BaseStreamingCSVExportCommand):
    """
    Command to execute a streaming CSV export of SQL Lab query results.

    This command handles SQL Lab-specific logic:
    - Query validation and access control
    - SQL parsing and limit extraction
    - LimitingFactor-based row limit adjustment
    """

    def __init__(
        self,
        client_id: str,
        chunk_size: int = 1000,
    ):
        """
        Initialize the SQL Lab streaming export command.

        Args:
            client_id: The SQL Lab query client ID
            chunk_size: Number of rows to fetch per database query (default: 1000)
        """
        super().__init__(chunk_size)
        self._client_id = client_id
        self._query: Query | None = None

    def validate(self) -> None:
        """Validate permissions and query existence."""
        self._query = (
            db.session.query(Query).filter_by(client_id=self._client_id).one_or_none()
        )
        if self._query is None:
            raise ZobiErrorException(
                ZobiError(
                    message=__(
                        "The query associated with these results could not be found. "
                        "You need to re-run the original query."
                    ),
                    error_type=ZobiErrorType.RESULTS_BACKEND_ERROR,
                    level=ErrorLevel.ERROR,
                ),
                status=404,
            )

        try:
            self._query.raise_for_access()
        except ZobiSecurityException as ex:
            raise ZobiErrorException(
                ZobiError(
                    message=__("Cannot access the query"),
                    error_type=ZobiErrorType.QUERY_SECURITY_ACCESS_ERROR,
                    level=ErrorLevel.ERROR,
                ),
                status=403,
            ) from ex

    def _get_sql_and_database(self) -> tuple[str, Any, str | None, str | None]:
        """
        Get the SQL query, database, catalog, and schema for SQL Lab export.

        Returns:
            Tuple of (sql_query, database_object, catalog, schema)
        """
        assert self._query is not None

        select_sql = self._query.select_sql
        executed_sql = self._query.executed_sql
        database = self._query.database

        # Get the SQL query
        sql = select_sql or executed_sql

        return sql, database, self._query.catalog, self._query.schema

    def _get_row_limit(self) -> int | None:
        """
        Get the row limit for SQL Lab export.

        Handles SQL Lab's complex limit logic based on limiting_factor.

        Returns:
            Adjusted row limit or None for unlimited
        """
        assert self._query is not None

        select_sql = self._query.select_sql
        executed_sql = self._query.executed_sql
        limiting_factor = self._query.limiting_factor
        database = self._query.database

        # Get limit from SQL
        if select_sql:
            limit = None
        else:
            sql = executed_sql
            script = SQLScript(sql, database.db_engine_spec.engine)
            # when a query has multiple statements only the last one returns data
            limit = script.statements[-1].get_limit_value()

        # Adjust limit based on limiting factor
        if limit is not None and limiting_factor in {
            LimitingFactor.QUERY,
            LimitingFactor.DROPDOWN,
            LimitingFactor.QUERY_AND_DROPDOWN,
        }:
            # remove extra row from `increased_limit`
            limit -= 1

        return limit
