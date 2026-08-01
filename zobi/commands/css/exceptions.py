from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import CommandException, DeleteFailedError


class CssTemplateDeleteFailedError(DeleteFailedError):
    message = _("CSS templates could not be deleted.")


class CssTemplateNotFoundError(CommandException):
    message = _("CSS template not found.")
