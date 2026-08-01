from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import CommandException


class DatasetColumnNotFoundError(CommandException):
    message = _("Dataset column not found.")


class DatasetColumnDeleteFailedError(CommandException):
    message = _("Dataset column delete failed.")


class DatasetColumnForbiddenError(CommandException):
    message = _("Changing this dataset is forbidden.")
