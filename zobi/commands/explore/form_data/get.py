import logging
from abc import ABC
from typing import Optional

from flask import current_app as app
from sqlalchemy.exc import SQLAlchemyError

from zobi.commands.base import BaseCommand
from zobi.commands.explore.form_data.parameters import CommandParameters
from zobi.commands.explore.form_data.state import TemporaryExploreState
from zobi.commands.explore.form_data.utils import check_access
from zobi.commands.temporary_cache.exceptions import TemporaryCacheGetFailedError
from zobi.extensions import cache_manager
from zobi.utils.core import DatasourceType

logger = logging.getLogger(__name__)


class GetFormDataCommand(BaseCommand, ABC):
    def __init__(self, cmd_params: CommandParameters) -> None:
        self._cmd_params = cmd_params
        self._refresh_timeout = app.config["EXPLORE_FORM_DATA_CACHE_CONFIG"].get(
            "REFRESH_TIMEOUT_ON_RETRIEVAL"
        )

    def run(self) -> Optional[str]:
        try:
            key = self._cmd_params.key
            state: TemporaryExploreState = cache_manager.explore_form_data_cache.get(
                key
            )
            if state:
                check_access(
                    state["datasource_id"],
                    state["chart_id"],
                    DatasourceType(state["datasource_type"]),
                )
                if self._refresh_timeout:
                    cache_manager.explore_form_data_cache.set(key, state)
                return state["form_data"]
            return None
        except SQLAlchemyError as ex:
            logger.exception("Error running get command")
            raise TemporaryCacheGetFailedError() from ex

    def validate(self) -> None:
        pass
