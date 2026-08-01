import logging

from flask import session
from sqlalchemy.exc import SQLAlchemyError

from zobi.commands.base import BaseCommand
from zobi.commands.explore.form_data.parameters import CommandParameters
from zobi.commands.explore.form_data.state import TemporaryExploreState
from zobi.commands.explore.form_data.utils import check_access
from zobi.commands.temporary_cache.exceptions import TemporaryCacheCreateFailedError
from zobi.extensions import cache_manager
from zobi.key_value.utils import random_key
from zobi.temporary_cache.utils import cache_key
from zobi.utils.core import DatasourceType, get_user_id
from zobi.utils.schema import validate_json

logger = logging.getLogger(__name__)


class CreateFormDataCommand(BaseCommand):
    def __init__(self, cmd_params: CommandParameters):
        self._cmd_params = cmd_params

    def _get_session_id(self) -> str | None:
        """Get session ID. Can be overridden in subclasses."""
        return session.get("_id")

    def run(self) -> str:
        self.validate()
        try:
            datasource_id = self._cmd_params.datasource_id
            datasource_type = self._cmd_params.datasource_type
            chart_id = self._cmd_params.chart_id
            tab_id = self._cmd_params.tab_id
            form_data = self._cmd_params.form_data
            check_access(datasource_id, chart_id, datasource_type)
            contextual_key = cache_key(
                self._get_session_id(), tab_id, datasource_id, chart_id, datasource_type
            )
            key = cache_manager.explore_form_data_cache.get(contextual_key)
            if not key or not tab_id:
                key = random_key()
            if form_data:
                state: TemporaryExploreState = {
                    "owner": get_user_id(),
                    "datasource_id": datasource_id,
                    "datasource_type": DatasourceType(datasource_type),
                    "chart_id": chart_id,
                    "form_data": form_data,
                }
                cache_manager.explore_form_data_cache.set(key, state)
                cache_manager.explore_form_data_cache.set(contextual_key, key)
            return key
        except SQLAlchemyError as ex:
            logger.exception("Error running create command")
            raise TemporaryCacheCreateFailedError() from ex

    def validate(self) -> None:
        if self._cmd_params.form_data:
            validate_json(self._cmd_params.form_data)
