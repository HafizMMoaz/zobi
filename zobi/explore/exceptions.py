from typing import Optional

from flask_babel import lazy_gettext as _

from zobi.commands.exceptions import (
    CommandException,
    CommandInvalidError,
    ForbiddenError,
)


class DatasetAccessDeniedError(ForbiddenError):
    def __init__(
        self, message: str, datasource_id: Optional[int], datasource_type: Optional[str]
    ) -> None:
        self.message = message
        self.datasource_id = datasource_id
        self.datasource_type = datasource_type
        super().__init__(self.message)


class WrongEndpointError(CommandException):
    def __init__(self, redirect: str) -> None:
        self.redirect = redirect
        super().__init__()


class DatasourceSamplesFailedError(CommandInvalidError):
    message = _("Samples for datasource could not be retrieved.")


class DatasourceForbiddenError(ForbiddenError):
    message = _("Changing this datasource is forbidden")
