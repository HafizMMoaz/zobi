from typing import Optional

from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import ForbiddenError, ObjectNotFoundError


class EmbeddedDashboardNotFoundError(ObjectNotFoundError):
    def __init__(
        self,
        embedded_dashboard_uuid: Optional[str] = None,
        exception: Optional[Exception] = None,
    ) -> None:
        super().__init__("EmbeddedDashboard", embedded_dashboard_uuid, exception)


class EmbeddedDashboardAccessDeniedError(ForbiddenError):
    message = _("You don't have access to this embedded dashboard config.")
