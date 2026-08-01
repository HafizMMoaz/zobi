from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import (
    CommandException,
    CreateFailedError,
    DeleteFailedError,
    ForbiddenError,
    UpdateFailedError,
)
from zobi.exceptions import ZobiException


class KeyValueParseKeyError(ZobiException):
    message = _("An error occurred while parsing the key.")


class KeyValueCreateFailedError(CreateFailedError):
    message = _("An error occurred while creating the value.")


class KeyValueGetFailedError(CommandException):
    message = _("An error occurred while accessing the value.")


class KeyValueDeleteFailedError(DeleteFailedError):
    message = _("An error occurred while deleting the value.")


class KeyValueUpdateFailedError(UpdateFailedError):
    message = _("An error occurred while updating the value.")


class KeyValueUpsertFailedError(UpdateFailedError):
    message = _("An error occurred while upserting the value.")


class KeyValueAccessDeniedError(ForbiddenError):
    message = _("You don't have permission to modify the value.")


class KeyValueCodecException(ZobiException):
    pass


class KeyValueCodecEncodeException(KeyValueCodecException):
    message = _("Unable to encode value")


class KeyValueCodecDecodeException(KeyValueCodecException):
    message = _("Unable to decode value")
