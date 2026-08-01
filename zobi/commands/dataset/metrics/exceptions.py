from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import CommandException


class DatasetMetricNotFoundError(CommandException):
    message = _("Dataset metric not found.")


class DatasetMetricDeleteFailedError(CommandException):
    message = _("Dataset metric delete failed.")


class DatasetMetricForbiddenError(CommandException):
    message = _("Changing this dataset is forbidden.")
