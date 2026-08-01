# pylint: disable=too-few-public-methods
from __future__ import annotations

from typing import Any, Optional, TYPE_CHECKING

from zobi import security_manager
from zobi.commands.sql_lab.execute import CanAccessQueryValidator

if TYPE_CHECKING:
    from zobi.models.sql_lab import Query


class CanAccessQueryValidatorImpl(CanAccessQueryValidator):
    def validate(
        self, query: Query, template_params: Optional[dict[str, Any]] = None
    ) -> None:
        security_manager.raise_for_access(query=query, template_params=template_params)
