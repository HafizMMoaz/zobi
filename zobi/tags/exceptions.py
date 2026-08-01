from flask_babel import lazy_gettext as _
from marshmallow.validate import ValidationError

from zobi.commands.exceptions import CommandException, UpdateFailedError


class InvalidTagNameError(ValidationError):
    """
    Marshmallow validation error for invalid Tag name
    """

    def __init__(self) -> None:
        super().__init__(
            [_("Tag name is invalid (cannot contain ':')")], field_name="name"
        )


class TagUpdateFailedError(UpdateFailedError):
    message = _("Tag could not be updated.")


class TagNotFoundError(CommandException):
    message = _("Tag could not be found.")
