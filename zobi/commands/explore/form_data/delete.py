import logging
from abc import ABC
from typing import Optional

from flask import session
from sqlalchemy.exc import SQLAlchemyError

from zobi.commands.base import BaseCommand
from zobi.commands.explore.form_data.parameters import CommandParameters
from zobi.commands.explore.form_data.state import TemporaryExploreState
from zobi.commands.explore.form_data.utils import check_access
from zobi.commands.temporary_cache.exceptions import (
    TemporaryCacheAccessDeniedError,
    TemporaryCacheDeleteFailedError,
)
from zobi.extensions import cache_manager
from zobi.temporary_cache.utils import cache_key
from zobi.utils.core import DatasourceType, get_user_id

logger = logging.getLogger(__name__)


class DeleteFormDataCommand(BaseCommand, ABC):
    def __init__(self, cmd_params: CommandParameters):
        self._cmd_params = cmd_params

    def run(self) -> bool:
        try:
            key = self._cmd_params.key
            state: TemporaryExploreState = cache_manager.explore_form_data_cache.get(
                key
            )
            if state:
                datasource_id: int = state["datasource_id"]
                chart_id: Optional[int] = state["chart_id"]
                datasource_type = DatasourceType(state["datasource_type"])
                check_access(datasource_id, chart_id, datasource_type)
                if state["owner"] != get_user_id():
                    raise TemporaryCacheAccessDeniedError()
                tab_id = self._cmd_params.tab_id
                contextual_key = cache_key(
                    session.get("_id"), tab_id, datasource_id, chart_id, datasource_type
                )
                cache_manager.explore_form_data_cache.delete(contextual_key)
                return cache_manager.explore_form_data_cache.delete(key)
            return False
        except SQLAlchemyError as ex:
            logger.exception("Error running delete command")
            raise TemporaryCacheDeleteFailedError() from ex

    def validate(self) -> None:
        pass
