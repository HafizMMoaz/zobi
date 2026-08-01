from flask_babel import lazy_gettext as _
from marshmallow import ValidationError

from zobi.commands.exceptions import (
    CommandException,
    CommandInvalidError,
    CreateFailedError,
    DeleteFailedError,
)


class AnnotationDatesValidationError(ValidationError):
    """
    Marshmallow validation error for start date is after end date
    """

    def __init__(self) -> None:
        super().__init__(
            [_("End date must be after start date")], field_name="start_dttm"
        )


class AnnotationUniquenessValidationError(ValidationError):
    """
    Marshmallow validation error for annotation layer name already exists
    """

    def __init__(self) -> None:
        super().__init__(
            [_("Short description must be unique for this layer")],
            field_name="short_descr",
        )


class AnnotationNotFoundError(CommandException):
    message = _("Annotation not found.")


class AnnotationInvalidError(CommandInvalidError):
    message = _("Annotation parameters are invalid.")


class AnnotationCreateFailedError(CreateFailedError):
    message = _("Annotation could not be created.")


class AnnotationUpdateFailedError(CreateFailedError):
    message = _("Annotation could not be updated.")


class AnnotationDeleteFailedError(DeleteFailedError):
    message = _("Annotations could not be deleted.")
