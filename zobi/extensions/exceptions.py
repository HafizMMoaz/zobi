from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import (
    CommandException,
    CreateFailedError,
    DeleteFailedError,
    UpdateFailedError,
)


class ExtensionCreateFailedError(CreateFailedError):
    message = _("An error occurred while creating the extension.")


class ExtensionGetFailedError(CommandException):
    message = _("An error occurred while accessing the extension.")


class ExtensionDeleteFailedError(DeleteFailedError):
    message = _("An error occurred while deleting the extension.")


class ExtensionUpdateFailedError(UpdateFailedError):
    message = _("An error occurred while updating the extension.")


class ExtensionUpsertFailedError(UpdateFailedError):
    message = _("An error occurred while upserting the extension.")


class BundleValidationError(Exception):
    pass
