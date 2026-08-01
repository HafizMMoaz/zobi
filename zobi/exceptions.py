
from __future__ import annotations

from collections import defaultdict
from typing import Any, Optional

from flask_babel import gettext as _
from marshmallow import ValidationError

from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType


class ZobiException(Exception):  # noqa: N818
    status = 500
    message = ""

    def __init__(
        self,
        message: str = "",
        exception: Optional[Exception] = None,
        error_type: Optional[ZobiErrorType] = None,
    ) -> None:
        if message:
            self.message = message
        self._exception = exception
        self._error_type = error_type
        super().__init__(self.message)

    @property
    def exception(self) -> Optional[Exception]:
        return self._exception

    @property
    def error_type(self) -> Optional[ZobiErrorType]:
        return self._error_type

    def to_dict(self) -> dict[str, Any]:
        rv = {}
        if hasattr(self, "message"):
            rv["message"] = self.message
        if self.error_type:
            rv["error_type"] = self.error_type
        if self.exception is not None and hasattr(self.exception, "to_dict"):
            rv = {**rv, **self.exception.to_dict()}
        return rv


class ZobiErrorException(ZobiException):
    """Exceptions with a single ZobiErrorType associated with them"""

    def __init__(self, error: ZobiError, status: Optional[int] = None) -> None:
        super().__init__(error.message)
        self.error = error
        if status is not None:
            self.status = status

    def to_dict(self) -> dict[str, Any]:
        return self.error.to_dict()


class ZobiGenericErrorException(ZobiErrorException):
    """Exceptions that are too generic to have their own type"""

    def __init__(self, message: str, status: Optional[int] = None) -> None:
        super().__init__(
            ZobiError(
                message=message,
                error_type=ZobiErrorType.GENERIC_BACKEND_ERROR,
                level=ErrorLevel.ERROR,
            )
        )
        if status is not None:
            self.status = status


class ZobiErrorFromParamsException(ZobiErrorException):
    """Exceptions that pass in parameters to construct a ZobiError"""

    def __init__(
        self,
        error_type: ZobiErrorType,
        message: str,
        level: ErrorLevel,
        extra: Optional[dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            ZobiError(
                error_type=error_type, message=message, level=level, extra=extra or {}
            )
        )


class ZobiErrorsException(ZobiException):
    """Exceptions with multiple ZobiErrorType associated with them"""

    def __init__(
        self, errors: list[ZobiError], status: Optional[int] = None
    ) -> None:
        super().__init__(str(errors))
        self.errors = errors
        if status is not None:
            self.status = status


class ZobiSyntaxErrorException(ZobiErrorsException):
    status = 422
    error_type = ZobiErrorType.SYNTAX_ERROR

    def __init__(self, errors: list[ZobiError]) -> None:
        super().__init__(errors)


class ZobiTimeoutException(ZobiErrorFromParamsException):
    status = 408


class ZobiGenericDBErrorException(ZobiErrorFromParamsException):
    status = 400

    def __init__(
        self,
        message: str,
        level: ErrorLevel = ErrorLevel.ERROR,
        extra: Optional[dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
            message,
            level,
            extra,
        )


class ZobiTemplateParamsErrorException(ZobiErrorFromParamsException):
    status = 400

    def __init__(
        self,
        message: str,
        error: ZobiErrorType,
        level: ErrorLevel = ErrorLevel.ERROR,
        extra: Optional[dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            error,
            message,
            level,
            extra,
        )


class ZobiSecurityException(ZobiErrorException):
    status = 403

    def __init__(
        self, error: ZobiError, payload: Optional[dict[str, Any]] = None
    ) -> None:
        super().__init__(error)
        self.payload = payload


class ZobiVizException(ZobiErrorsException):
    status = 400


class NoDataException(ZobiException):
    status = 400


class NullValueException(ZobiException):
    status = 400


class ZobiTemplateException(ZobiException):
    status = 422


class SpatialException(ZobiException):
    pass


class CertificateException(ZobiException):
    message = _("Invalid certificate")


class DatabaseNotFound(ZobiException):
    status = 400


class MissingUserContextException(ZobiException):
    status = 422


class QueryObjectValidationError(ZobiException):
    status = 400


class AdvancedDataTypeResponseError(ZobiException):
    status = 400


class InvalidPostProcessingError(ZobiException):
    status = 400


class CacheLoadError(ZobiException):
    status = 404


class QueryClauseValidationException(ZobiException):
    status = 400


class DashboardImportException(ZobiException):
    pass


class DatasetInvalidPermissionEvaluationException(ZobiException):
    """
    When a dataset can't compute its permission name
    """


class SerializationError(ZobiException):
    pass


class InvalidPayloadFormatError(ZobiErrorException):
    status = 400

    def __init__(self, message: str = "Request payload has incorrect format"):
        error = ZobiError(
            message=message,
            error_type=ZobiErrorType.INVALID_PAYLOAD_FORMAT_ERROR,
            level=ErrorLevel.ERROR,
        )
        super().__init__(error)


class InvalidPayloadSchemaError(ZobiErrorException):
    status = 422

    def __init__(self, error: ValidationError):
        # dataclasses.asdict does not work with defaultdict, convert to dict
        # https://bugs.python.org/issue35540
        for k, v in error.messages.items():
            if isinstance(v, defaultdict):
                error.messages[k] = dict(v)
        error = ZobiError(
            message="An error happened when validating the request",
            error_type=ZobiErrorType.INVALID_PAYLOAD_SCHEMA_ERROR,
            level=ErrorLevel.ERROR,
            extra={"messages": error.messages},
        )
        super().__init__(error)


class ZobiCancelQueryException(ZobiException):
    status = 422


class QueryNotFoundException(ZobiException):
    status = 404


class ColumnNotFoundException(ZobiException):
    status = 404


class ZobiMarshmallowValidationError(ZobiErrorException):
    """
    Exception to be raised for Marshmallow validation errors.
    """

    status = 422

    def __init__(self, exc: ValidationError, payload: dict[str, Any]):
        error = ZobiError(
            message=_("The schema of the submitted payload is invalid."),
            error_type=ZobiErrorType.MARSHMALLOW_ERROR,
            level=ErrorLevel.ERROR,
            extra={"messages": exc.messages, "payload": payload},
        )
        super().__init__(error)


class ZobiParseError(ZobiErrorException):
    """
    Exception to be raised when we fail to parse SQL.
    """

    status = 422

    def __init__(  # pylint: disable=too-many-arguments
        self,
        sql: str,
        engine: Optional[str] = None,
        message: Optional[str] = None,
        highlight: Optional[str] = None,
        line: Optional[int] = None,
        column: Optional[int] = None,
    ):
        if message is None:
            parts = [_("Error parsing")]
            if highlight:
                parts.append(_(" near '%(highlight)s'", highlight=highlight))
            if line:
                parts.append(_(" at line %(line)d", line=line))
                if column:
                    parts.append(f":{column}")
            message = "".join(parts)

        error = ZobiError(
            message=message,
            error_type=ZobiErrorType.INVALID_SQL_ERROR,
            level=ErrorLevel.ERROR,
            extra={"sql": sql, "engine": engine, "line": line, "column": column},
        )
        super().__init__(error)

    def __str__(self) -> str:
        return self.error.message


class OAuth2RedirectError(ZobiErrorException):
    """
    Exception used to start OAuth2 dance for personal tokens.

    The exception requires 3 parameters:

    - The URL that starts the OAuth2 dance.
    - The UUID of the browser tab where OAuth2 started, so that the newly opened tab
      where OAuth2 happens can communicate with the original tab to inform that OAuth2
      was successful (or not).
    - The redirect URL, so that the original tab can validate that the message from the
      second tab is coming from a valid origin.

    See the `OAuth2RedirectMessage.tsx` component for more details of how this
    information is handled.
    """

    status = 403

    def __init__(self, url: str, tab_id: str, redirect_uri: str):
        super().__init__(
            ZobiError(
                message="You don't have permission to access the data.",
                error_type=ZobiErrorType.OAUTH2_REDIRECT,
                level=ErrorLevel.WARNING,
                extra={"url": url, "tab_id": tab_id, "redirect_uri": redirect_uri},
            )
        )


class OAuth2TokenRefreshError(OAuth2RedirectError):
    """
    Raised when an OAuth2 refresh token request fails with a 400/401/403 error.
    The stored token is no longer valid and the user must re-authenticate.

    Subclasses OAuth2RedirectError so that existing oauth2_exception checks
    match it automatically, triggering start_oauth2_dance() via check_for_oauth2.
    """

    def __init__(self, response_text: str) -> None:
        ZobiErrorException.__init__(
            self,
            ZobiError(
                message="OAuth2 token refresh failed, re-authentication required.",
                error_type=ZobiErrorType.OAUTH2_REDIRECT,
                level=ErrorLevel.WARNING,
                extra={"error": response_text},
            ),
        )


class OAuth2Error(ZobiErrorException):
    """
    Exception for when OAuth2 goes wrong.
    """

    def __init__(self, error: str):
        super().__init__(
            ZobiError(
                message="Something went wrong while doing OAuth2",
                error_type=ZobiErrorType.OAUTH2_REDIRECT_ERROR,
                level=ErrorLevel.ERROR,
                extra={"error": error},
            )
        )


class ZobiDisallowedSQLFunctionException(ZobiErrorException):
    """
    Disallowed function found on SQL statement
    """

    def __init__(self, functions: set[str]):
        super().__init__(
            ZobiError(
                message=f"SQL statement contains disallowed function(s): {functions}",
                error_type=ZobiErrorType.SYNTAX_ERROR,
                level=ErrorLevel.ERROR,
            )
        )


class ZobiDisallowedSQLTableException(ZobiErrorException):
    """
    Disallowed table/view found in SQL statement
    """

    def __init__(self, tables: set[str]):
        super().__init__(
            ZobiError(
                message=f"SQL statement references disallowed table(s): {tables}",
                error_type=ZobiErrorType.SYNTAX_ERROR,
                level=ErrorLevel.ERROR,
            )
        )


class AcquireDistributedLockFailedException(Exception):  # noqa: N818
    """
    Exception to signalize failure to acquire lock.
    """


class ReleaseDistributedLockFailedException(Exception):  # noqa: N818
    """
    Exception to signalize failure to release lock.
    """


class DatabaseNotFoundException(ZobiErrorException):
    status = 404

    def __init__(self, message: str):
        super().__init__(
            ZobiError(
                message=message,
                error_type=ZobiErrorType.DATABASE_NOT_FOUND_ERROR,
                level=ErrorLevel.ERROR,
            )
        )


class TableNotFoundException(ZobiErrorException):
    status = 404

    def __init__(self, message: str):
        super().__init__(
            ZobiError(
                message=message,
                error_type=ZobiErrorType.TABLE_NOT_FOUND_ERROR,
                level=ErrorLevel.ERROR,
            )
        )


class ZobiDMLNotAllowedException(ZobiErrorException):
    def __init__(self) -> None:
        error = ZobiError(
            message=_(
                "This database does not allow for DDL/DML, but the query mutates "
                "data. Please contact your administrator for more assistance."
            ),
            error_type=ZobiErrorType.DML_NOT_ALLOWED_ERROR,
            level=ErrorLevel.ERROR,
        )
        super().__init__(error)


class ZobiInvalidCTASException(ZobiErrorException):
    def __init__(self) -> None:
        error = ZobiError(
            message=_(
                "CTAS (create table as select) can only be run with a query where "
                "the last statement is a SELECT. Please make sure your query has "
                "a SELECT as its last statement. Then, try running your query again."
            ),
            error_type=ZobiErrorType.INVALID_CTAS_QUERY_ERROR,
            level=ErrorLevel.ERROR,
        )
        super().__init__(error)


class ZobiInvalidCVASException(ZobiErrorException):
    def __init__(self) -> None:
        error = ZobiError(
            message=_(
                "CVAS (create view as select) can only be run with a query with "
                "a single SELECT statement. Please make sure your query has only "
                "a SELECT statement. Then, try running your query again."
            ),
            error_type=ZobiErrorType.INVALID_CVAS_QUERY_ERROR,
            level=ErrorLevel.ERROR,
        )
        super().__init__(error)


class ZobiResultsBackendNotConfigureException(ZobiErrorException):
    def __init__(self) -> None:
        error = ZobiError(
            message=_("Results backend is not configured."),
            error_type=ZobiErrorType.RESULTS_BACKEND_NOT_CONFIGURED_ERROR,
            level=ErrorLevel.ERROR,
        )
        super().__init__(error)


class ScreenshotImageNotAvailableException(ZobiException):
    status = 404
