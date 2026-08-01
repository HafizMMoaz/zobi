from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import (
    CommandException,
    CommandInvalidError,
    CreateFailedError,
    DeleteFailedError,
    ForbiddenError,
    UpdateFailedError,
)


class SemanticViewNotFoundError(CommandException):
    status = 404
    message = _("Semantic view does not exist")


class SemanticViewForbiddenError(ForbiddenError):
    message = _("Changing this semantic view is forbidden")


class SemanticViewInvalidError(CommandInvalidError):
    message = _("Semantic view parameters are invalid.")


class SemanticViewUpdateFailedError(UpdateFailedError):
    message = _("Semantic view could not be updated.")


class SemanticLayerNotFoundError(CommandException):
    status = 404
    message = _("Semantic layer does not exist")


class SemanticLayerForbiddenError(ForbiddenError):
    message = _("Changing this semantic layer is forbidden")


class SemanticLayerInvalidError(CommandInvalidError):
    message = _("Semantic layer parameters are invalid.")


class SemanticLayerCreateFailedError(CreateFailedError):
    message = _("Semantic layer could not be created.")


class SemanticLayerUpdateFailedError(UpdateFailedError):
    message = _("Semantic layer could not be updated.")


class SemanticLayerDeleteFailedError(DeleteFailedError):
    message = _("Semantic layer could not be deleted.")


class SemanticViewCreateFailedError(CreateFailedError):
    message = _("Semantic view could not be created.")


class SemanticViewDeleteFailedError(DeleteFailedError):
    message = _("Semantic view could not be deleted.")
