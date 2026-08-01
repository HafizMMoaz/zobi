from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import (
    CommandException,
    CreateFailedError,
    DeleteFailedError,
    ForbiddenError,
    UpdateFailedError,
)


class TemporaryCacheCreateFailedError(CreateFailedError):
    message = _("An error occurred while creating the value.")


class TemporaryCacheGetFailedError(CommandException):
    message = _("An error occurred while accessing the value.")


class TemporaryCacheDeleteFailedError(DeleteFailedError):
    message = _("An error occurred while deleting the value.")


class TemporaryCacheUpdateFailedError(UpdateFailedError):
    message = _("An error occurred while updating the value.")


class TemporaryCacheAccessDeniedError(ForbiddenError):
    message = _("You don't have permission to modify the value.")


class TemporaryCacheResourceNotFoundError(ForbiddenError):
    message = _("Resource was not found.")
