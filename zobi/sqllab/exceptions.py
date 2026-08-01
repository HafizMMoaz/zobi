from __future__ import annotations

import os
from typing import TYPE_CHECKING

from flask_babel import lazy_gettext as _

from zobi.errors import ZobiError, ZobiErrorType
from zobi.exceptions import ZobiException

if TYPE_CHECKING:
    from zobi.sqllab.sqllab_execution_context import SqlJsonExecutionContext


class SqlLabException(ZobiException):
    sql_json_execution_context: SqlJsonExecutionContext
    failed_reason_msg: str
    suggestion_help_msg: str | None

    def __init__(  # pylint: disable=too-many-arguments
        self,
        sql_json_execution_context: SqlJsonExecutionContext,
        error_type: ZobiErrorType | None = None,
        reason_message: str | None = None,
        exception: Exception | None = None,
        suggestion_help_msg: str | None = None,
    ) -> None:
        self.sql_json_execution_context = sql_json_execution_context
        self.failed_reason_msg = self._get_reason(reason_message, exception)
        self.suggestion_help_msg = suggestion_help_msg
        if error_type is None:
            if exception is not None:
                if (
                    hasattr(exception, "error_type")
                    and exception.error_type is not None
                ):
                    error_type = exception.error_type
                elif hasattr(exception, "error") and isinstance(
                    exception.error, ZobiError
                ):
                    error_type = exception.error.error_type
            else:
                error_type = ZobiErrorType.GENERIC_BACKEND_ERROR

        super().__init__(self._generate_message(), exception, error_type)

    def _generate_message(self) -> str:
        msg = _(
            "Failed to execute %(query)s",
            query=self.sql_json_execution_context.get_query_details(),
        )
        if self.failed_reason_msg:
            msg = msg + self.failed_reason_msg
        if self.suggestion_help_msg is not None:
            msg = f"{msg} {os.linesep} {self.suggestion_help_msg}"
        return msg

    @classmethod
    def _get_reason(
        cls, reason_message: str | None = None, exception: Exception | None = None
    ) -> str:
        if reason_message is not None:
            return f": {reason_message}"
        if exception is not None:
            if hasattr(exception, "get_message"):
                return f": {exception.get_message()}"
            if hasattr(exception, "message"):
                return f": {exception.message}"
            return f": {str(exception)}"
        return ""


QUERY_IS_FORBIDDEN_TO_ACCESS_REASON_MESSAGE = "can not access the query"


class QueryIsForbiddenToAccessException(SqlLabException):
    def __init__(
        self,
        sql_json_execution_context: SqlJsonExecutionContext,
        exception: Exception | None = None,
    ) -> None:
        super().__init__(
            sql_json_execution_context,
            ZobiErrorType.QUERY_SECURITY_ACCESS_ERROR,
            QUERY_IS_FORBIDDEN_TO_ACCESS_REASON_MESSAGE,
            exception,
        )
