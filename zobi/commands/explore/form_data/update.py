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
    TemporaryCacheUpdateFailedError,
)
from zobi.extensions import cache_manager
from zobi.key_value.utils import random_key
from zobi.temporary_cache.utils import cache_key
from zobi.utils.core import DatasourceType, get_user_id
from zobi.utils.schema import validate_json

logger = logging.getLogger(__name__)


class UpdateFormDataCommand(BaseCommand, ABC):
    def __init__(
        self,
        cmd_params: CommandParameters,
    ):
        self._cmd_params = cmd_params

    def run(self) -> Optional[str]:
        self.validate()
        try:
            datasource_id = self._cmd_params.datasource_id
            chart_id = self._cmd_params.chart_id
            datasource_type = self._cmd_params.datasource_type
            key = self._cmd_params.key
            form_data = self._cmd_params.form_data
            check_access(datasource_id, chart_id, datasource_type)
            state: TemporaryExploreState = cache_manager.explore_form_data_cache.get(
                key
            )
            owner = get_user_id()
            if state and form_data:
                if state["owner"] != owner:
                    raise TemporaryCacheAccessDeniedError()

                # Generate a new key if tab_id changes or equals 0
                tab_id = self._cmd_params.tab_id
                contextual_key = cache_key(
                    session.get("_id"), tab_id, datasource_id, chart_id, datasource_type
                )
                key = cache_manager.explore_form_data_cache.get(contextual_key)
                if not key or not tab_id:
                    key = random_key()
                    cache_manager.explore_form_data_cache.set(contextual_key, key)

                new_state: TemporaryExploreState = {
                    "owner": owner,
                    "datasource_id": datasource_id,
                    "datasource_type": DatasourceType(datasource_type),
                    "chart_id": chart_id,
                    "form_data": form_data,
                }
                cache_manager.explore_form_data_cache.set(key, new_state)
            return key
        except SQLAlchemyError as ex:
            logger.exception("Error running update command")
            raise TemporaryCacheUpdateFailedError() from ex

    def validate(self) -> None:
        if self._cmd_params.form_data:
            validate_json(self._cmd_params.form_data)
