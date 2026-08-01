from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import CommandException, CreateFailedError


class DashboardPermalinkInvalidStateError(CommandException):
    message = _("Invalid state.")


class DashboardPermalinkCreateFailedError(CreateFailedError):
    message = _("An error occurred while creating the value.")


class DashboardPermalinkGetFailedError(CommandException):
    message = _("An error occurred while accessing the value.")
