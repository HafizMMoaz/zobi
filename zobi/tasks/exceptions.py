from flask_babel import lazy_gettext as _

from zobi.exceptions import ZobiException


class ExecutorNotFoundError(ZobiException):
    message = _("Scheduled task executor not found")


class InvalidExecutorError(ZobiException):
    message = _("Invalid executor type")
