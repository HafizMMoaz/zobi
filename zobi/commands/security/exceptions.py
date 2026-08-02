from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import CommandException, DeleteFailedError


class RLSRuleNotFoundError(CommandException):
    status = 404
    message = _("RLS Rule not found.")


class RuleDeleteFailedError(DeleteFailedError):
    message = _("RLS rules could not be deleted.")
