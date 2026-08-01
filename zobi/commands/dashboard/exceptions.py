from typing import Optional

from flask_babel import lazy_gettext as _
from marshmallow.validate import ValidationError

from zobi.commands.exceptions import (
    CommandInvalidError,
    CreateFailedError,
    DeleteFailedError,
    ForbiddenError,
    ImportFailedError,
    ObjectNotFoundError,
    UpdateFailedError,
)


class DashboardSlugExistsValidationError(ValidationError):
    """
    Marshmallow validation error for dashboard slug already exists
    """

    def __init__(self) -> None:
        super().__init__([_("Must be unique")], field_name="slug")


class DashboardInvalidError(CommandInvalidError):
    message = _("Dashboard parameters are invalid.")


class DashboardNotFoundError(ObjectNotFoundError):
    def __init__(
        self, dashboard_id: Optional[str] = None, exception: Optional[Exception] = None
    ) -> None:
        super().__init__("Dashboard", dashboard_id, exception)


class DashboardCreateFailedError(CreateFailedError):
    message = _("Dashboards could not be created.")


class DashboardUpdateFailedError(UpdateFailedError):
    message = _("Dashboard could not be updated.")


class DashboardNativeFiltersUpdateFailedError(UpdateFailedError):
    message = _("Dashboard native filters could not be patched.")


class DashboardChartCustomizationsUpdateFailedError(UpdateFailedError):
    message = _("Dashboard chart customizations could not be updated.")


class DashboardColorsConfigUpdateFailedError(UpdateFailedError):
    message = _("Dashboard color configuration could not be updated.")


class DashboardDeleteFailedError(DeleteFailedError):
    message = _("Dashboard could not be deleted.")


class DashboardDeleteEmbeddedFailedError(DeleteFailedError):
    message = _("Embedded dashboard could not be deleted.")


class DashboardDeleteFailedReportsExistError(DashboardDeleteFailedError):
    message = _("There are associated alerts or reports")


class DashboardForbiddenError(ForbiddenError):
    message = _("Changing this Dashboard is forbidden")


class DashboardImportError(ImportFailedError):
    message = _("Import dashboard failed for an unknown reason")


class DashboardAccessDeniedError(ForbiddenError):
    message = _("You don't have access to this dashboard.")


class DashboardCopyError(CommandInvalidError):
    message = _("Dashboard cannot be copied due to invalid parameters.")


class DashboardFaveError(CommandInvalidError):
    message = _("Dashboard cannot be favorited.")


class DashboardUnfaveError(CommandInvalidError):
    message = _("Dashboard cannot be unfavorited.")
