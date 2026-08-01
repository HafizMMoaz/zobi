from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from zobi.sqllab.command_status import SqlJsonExecutionStatus
from zobi.sqllab.utils import apply_display_max_row_configuration_if_require
from zobi.utils import json

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from zobi.sqllab.sqllab_execution_context import SqlJsonExecutionContext


class ExecutionContextConvertor:
    _max_row_in_display_configuration: int  # pylint: disable=invalid-name
    _exc_status: SqlJsonExecutionStatus
    payload: dict[str, Any]

    def set_max_row_in_display(self, value: int) -> None:
        self._max_row_in_display_configuration = value  # pylint: disable=invalid-name

    def set_payload(
        self,
        execution_context: SqlJsonExecutionContext,
        execution_status: SqlJsonExecutionStatus,
    ) -> None:
        self._exc_status = execution_status
        if execution_status == SqlJsonExecutionStatus.HAS_RESULTS:
            self.payload = execution_context.get_execution_result() or {}
        else:
            self.payload = execution_context.query.to_dict()

    def serialize_payload(self) -> str:
        if self._exc_status == SqlJsonExecutionStatus.HAS_RESULTS:
            return json.dumps(
                apply_display_max_row_configuration_if_require(
                    self.payload, self._max_row_in_display_configuration
                ),
                default=json.pessimistic_json_iso_dttm_ser,
                ignore_nan=True,
            )

        return json.dumps(
            {"query": self.payload},
            default=json.json_int_dttm_ser,
            ignore_nan=True,
        )
