

import logging
from typing import Any, Optional

from zobi.commands.base import BaseCommand
from zobi.commands.exceptions import DatasourceNotFoundValidationError
from zobi.commands.security.exceptions import RLSRuleNotFoundError
from zobi.commands.utils import populate_roles
from zobi.connectors.sqla.models import RowLevelSecurityFilter, SqlaTable
from zobi.daos.security import RLSDAO
from zobi.extensions import db
from zobi.utils.decorators import transaction

logger = logging.getLogger(__name__)


class UpdateRLSRuleCommand(BaseCommand):
    def __init__(self, model_id: int, data: dict[str, Any]):
        self._model_id = model_id
        self._properties = data.copy()
        self._tables = self._properties.get("tables", [])
        self._roles = self._properties.get("roles", [])
        self._model: Optional[RowLevelSecurityFilter] = None

    @transaction()
    def run(self) -> Any:
        self.validate()
        assert self._model
        return RLSDAO.update(self._model, self._properties)

    def validate(self) -> None:
        self._model = RLSDAO.find_by_id(int(self._model_id))
        if not self._model:
            raise RLSRuleNotFoundError()
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
