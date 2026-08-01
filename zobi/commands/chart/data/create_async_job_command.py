import logging
from typing import Any, Optional

from flask import Request

from zobi.extensions import async_query_manager

logger = logging.getLogger(__name__)


class CreateAsyncChartDataJobCommand:
    _async_channel_id: str

    def validate(self, request: Request) -> None:
        self._async_channel_id = async_query_manager.parse_channel_id_from_request(
            request
        )

    def run(self, form_data: dict[str, Any], user_id: Optional[int]) -> dict[str, Any]:
        return async_query_manager.submit_chart_data_job(
            self._async_channel_id, form_data, user_id
        )
