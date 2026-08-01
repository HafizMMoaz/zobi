from typing import Optional

from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import (
    CommandException,
    CommandInvalidError,
    CreateFailedError,
    DeleteFailedError,
    ObjectNotFoundError,
    UpdateFailedError,
)


class TagInvalidError(CommandInvalidError):
    message = _("Tag parameters are invalid.")


class TagCreateFailedError(CreateFailedError):
    message = _("Tag could not be created.")


class TagUpdateFailedError(UpdateFailedError):
    message = _("Tag could not be updated.")


class TagDeleteFailedError(DeleteFailedError):
    message = _("Tag could not be deleted.")


class TaggedObjectDeleteFailedError(DeleteFailedError):
    message = _("Tagged Object could not be deleted.")


class TagNotFoundError(ObjectNotFoundError):
    def __init__(self, tag_name: Optional[str] = None) -> None:
        message = "Tag not found."
        if tag_name:
            message = f"Tag with name {tag_name} not found."
        super().__init__(message)


class TaggedObjectNotFoundError(CommandException):
    def __init__(
        self,
        object_id: Optional[int] = None,
        object_type: Optional[str] = None,
        tag_name: Optional[str] = None,
    ) -> None:
        message = "Tagged Object not found."
        if object_id and object_type and tag_name:
            message = f'Tagged object with object_id: {object_id} \
                    object_type: {object_type} \
                    and tag name: "{tag_name}" could not be found'
        super().__init__(message)
