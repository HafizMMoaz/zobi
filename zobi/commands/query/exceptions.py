from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import (
    CommandException,
    CommandInvalidError,
    DeleteFailedError,
    ImportFailedError,
)


class SavedQueryDeleteFailedError(DeleteFailedError):
    message = _("Saved queries could not be deleted.")


class SavedQueryNotFoundError(CommandException):
    message = _("Saved query not found.")


class SavedQueryImportError(ImportFailedError):
    message = _("Import saved query failed for an unknown reason.")


class SavedQueryInvalidError(CommandInvalidError):
    message = _("Saved query parameters are invalid.")
