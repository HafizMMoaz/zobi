from flask_babel import lazy_gettext as _
from marshmallow.validate import ValidationError

from zobi.commands.exceptions import (
    CommandException,
    CommandInvalidError,
    CreateFailedError,
    DeleteFailedError,
    ImportFailedError,
    UpdateFailedError,
)
from zobi.exceptions import ZobiErrorException, ZobiErrorsException


class DatabaseInvalidError(CommandInvalidError):
    message = _("Database parameters are invalid.")


class DatabaseExistsValidationError(ValidationError):
    """
    Marshmallow validation error for dataset already exists
    """

    def __init__(self) -> None:
        super().__init__(
            _("A database with the same name already exists."),
            field_name="database_name",
        )


class DatabaseRequiredFieldValidationError(ValidationError):
    def __init__(self, field_name: str) -> None:
        super().__init__(
            [_("Field is required")],
            field_name=field_name,
        )


class DatabaseExtraJSONValidationError(ValidationError):
    """
    Marshmallow validation error for database encrypted extra must be a valid JSON
    """

    def __init__(self, json_error: str = "") -> None:
        super().__init__(
            [
                _(
                    "Field cannot be decoded by JSON. %(json_error)s",
                    json_error=json_error,
                )
            ],
            field_name="extra",
        )


class DatabaseExtraValidationError(ValidationError):
    """
    Marshmallow validation error for database encrypted extra must be a valid JSON
    """

    def __init__(self, key: str = "") -> None:
        super().__init__(
            [
                _(
                    "The metadata_params in Extra field "
                    "is not configured correctly. The key "
                    "%{key}s is invalid.",
                    key=key,
                )
            ],
            field_name="extra",
        )


class DatabaseConnectionSyncPermissionsError(CommandException):
    status = 500
    message = _("Unable to sync permissions for this database connection.")


class DatabaseNotFoundError(CommandException):
    status = 404
    message = _("Database not found.")


class UserNotFoundInSessionError(CommandException):
    status = 500
    message = _("Could not validate the user in the current session.")


class DatabaseSchemaUploadNotAllowed(CommandException):
    status = 403
    message = _("Database schema is not allowed for csv uploads.")


class DatabaseUploadNotSupported(CommandException):
    status = 422
    message = _("Database type does not support file uploads.")


class DatabaseUploadFailed(CommandException):
    status = 422
    message = _("Database upload file failed")


class DatabaseUploadSaveMetadataFailed(CommandException):
    status = 500
    message = _("Database upload file failed, while saving metadata")


class DatabaseCreateFailedError(CreateFailedError):
    message = _("Database could not be created.")


class DatabaseUpdateFailedError(UpdateFailedError):
    message = _("Database could not be updated.")


class DatabaseConnectionFailedError(  # pylint: disable=too-many-ancestors
    DatabaseCreateFailedError,
    DatabaseUpdateFailedError,
):
    message = _("Connection failed, please check your connection settings")


class MissingOAuth2TokenError(DatabaseUpdateFailedError):
    """
    Exception for when the connection is missing an OAuth2 token
    and it's not possible to initiate an OAuth2 dance.
    """

    message = _("Missing OAuth2 token")


class DatabaseDeleteDatasetsExistFailedError(DeleteFailedError):
    message = _("Cannot delete a database that has datasets attached")


class DatabaseDeleteFailedError(DeleteFailedError):
    message = _("Database could not be deleted.")


class DatabaseDeleteFailedReportsExistError(DatabaseDeleteFailedError):
    message = _("There are associated alerts or reports")


class DatabaseTestConnectionFailedError(ZobiErrorsException):
    status = 422
    message = _("Connection failed, please check your connection settings")


class DatabaseSecurityUnsafeError(CommandInvalidError):
    message = _("Stopped an unsafe database connection")


class DatabaseTestConnectionDriverError(CommandInvalidError):
    message = _("Could not load database driver")


class DatabaseTestConnectionUnexpectedError(ZobiErrorsException):
    status = 422
    message = _("Unexpected error occurred, please check your logs for details")


class DatabaseTablesUnexpectedError(CommandException):
    status = 422
    message = _("Unexpected error occurred, please check your logs for details")


class NoValidatorConfigFoundError(ZobiErrorException):
    status = 422
    message = _("no SQL validator is configured")


class NoValidatorFoundError(ZobiErrorException):
    status = 422
    message = _("No validator found (configured for the engine)")


class ValidatorSQLError(ZobiErrorException):
    status = 422
    message = _("Was unable to check your query")


class ValidatorSQLUnexpectedError(CommandException):
    status = 422
    message = _("An unexpected error occurred")


class ValidatorSQL400Error(ZobiErrorException):
    status = 400
    message = _("Was unable to check your query")


class DatabaseImportError(ImportFailedError):
    message = _("Import database failed for an unknown reason")


class InvalidEngineError(ZobiErrorException):
    status = 422


class DatabaseOfflineError(ZobiErrorException):
    status = 422


class InvalidParametersError(ZobiErrorsException):
    status = 422


class DatasetValidationError(CommandException):
    status = 422

    def __init__(self, err: Exception) -> None:
        super().__init__(
            _(
                "Dataset schema is invalid, caused by: %(error)s",
                error=str(err),
            )
        )
