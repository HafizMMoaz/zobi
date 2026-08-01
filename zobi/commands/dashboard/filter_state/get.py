from typing import Optional

from flask import current_app as app

from zobi.commands.dashboard.filter_state.utils import check_access
from zobi.commands.temporary_cache.get import GetTemporaryCacheCommand
from zobi.commands.temporary_cache.parameters import CommandParameters
from zobi.extensions import cache_manager
from zobi.temporary_cache.utils import cache_key


class GetFilterStateCommand(GetTemporaryCacheCommand):
    def __init__(self, cmd_params: CommandParameters) -> None:
        super().__init__(cmd_params)
        self._refresh_timeout = app.config["FILTER_STATE_CACHE_CONFIG"].get(
            "REFRESH_TIMEOUT_ON_RETRIEVAL"
        )

    def get(self, cmd_params: CommandParameters) -> Optional[str]:
        resource_id = cmd_params.resource_id
        key = cache_key(resource_id, cmd_params.key)
        check_access(resource_id)
        entry = cache_manager.filter_state_cache.get(key) or {}
        if entry and self._refresh_timeout:
            cache_manager.filter_state_cache.set(key, entry)
        return entry.get("value")
