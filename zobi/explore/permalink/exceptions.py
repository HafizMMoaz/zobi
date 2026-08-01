from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import CommandException, CreateFailedError


class ExplorePermalinkInvalidStateError(CreateFailedError):
    message = _("Invalid state.")


class ExplorePermalinkCreateFailedError(CreateFailedError):
    message = _("An error occurred while creating the value.")


class ExplorePermalinkGetFailedError(CommandException):
    message = _("An error occurred while accessing the value.")
