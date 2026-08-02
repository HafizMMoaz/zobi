import logging
from typing import Any

from zobi.commands.base import BaseCommand
from zobi.commands.exceptions import DatasourceNotFoundValidationError
from zobi.commands.utils import populate_roles
from zobi.connectors.sqla.models import SqlaTable
from zobi.daos.security import RLSDAO
from zobi.extensions import db
from zobi.utils.decorators import transaction

logger = logging.getLogger(__name__)


class CreateRLSRuleCommand(BaseCommand):
    def __init__(self, data: dict[str, Any]):
        self._properties = data.copy()
        self._tables = self._properties.get("tables", [])
        self._roles = self._properties.get("roles", [])

    @transaction()
    def run(self) -> Any:
        self.validate()
        return RLSDAO.create(attributes=self._properties)

    def validate(self) -> None:
        roles = populate_roles(self._roles)
        tables = (
            db.session.query(SqlaTable)
            .filter(SqlaTable.id.in_(self._tables))  # type: ignore[attr-defined]
            .all()
        )
        if len(tables) != len(self._tables):
            raise DatasourceNotFoundValidationError()
        self._properties["roles"] = roles
        self._properties["tables"] = tables
