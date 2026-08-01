import logging
from functools import partial
from typing import Any, Optional

from flask_appbuilder.models.sqla import Model
from marshmallow import ValidationError

from zobi.commands.base import BaseCommand, CreateMixin
from zobi.commands.dashboard.exceptions import (
    DashboardCreateFailedError,
    DashboardInvalidError,
    DashboardSlugExistsValidationError,
)
from zobi.commands.utils import populate_roles
from zobi.daos.dashboard import DashboardDAO
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class CreateDashboardCommand(CreateMixin, BaseCommand):
    def __init__(self, data: dict[str, Any]) -> None:
        self._properties = data.copy()

    @transaction(on_error=partial(on_error, reraise=DashboardCreateFailedError))
    def run(self) -> Model:
        self.validate()
        return DashboardDAO.create(attributes=self._properties)

    def validate(self) -> None:
        exceptions: list[ValidationError] = []
        owner_ids: Optional[list[int]] = self._properties.get("owners")
        role_ids: Optional[list[int]] = self._properties.get("roles")
        slug: str = self._properties.get("slug", "")

        # Validate slug uniqueness
        if not DashboardDAO.validate_slug_uniqueness(slug):
            exceptions.append(DashboardSlugExistsValidationError())

        try:
            owners = self.populate_owners(owner_ids)
            self._properties["owners"] = owners
        except ValidationError as ex:
            exceptions.append(ex)
        if exceptions:
            raise DashboardInvalidError(exceptions=exceptions)

        try:
            roles = populate_roles(role_ids)
            self._properties["roles"] = roles
        except ValidationError as ex:
            exceptions.append(ex)
        if exceptions:
            raise DashboardInvalidError(exceptions=exceptions)
