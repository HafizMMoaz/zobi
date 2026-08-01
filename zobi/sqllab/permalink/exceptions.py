from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import CommandException, CreateFailedError


class SqlLabPermalinkInvalidStateError(CreateFailedError):
    message = _("Invalid state.")


class SqlLabPermalinkCreateFailedError(CreateFailedError):
    message = _("An error occurred while creating the copy link.")


class SqlLabPermalinkGetFailedError(CommandException):
    message = _("An error occurred while accessing the copy link.")
