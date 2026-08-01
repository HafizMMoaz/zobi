from flask import session

from zobi.commands.dashboard.filter_state.utils import check_access
from zobi.commands.temporary_cache.delete import DeleteTemporaryCacheCommand
from zobi.commands.temporary_cache.entry import Entry
from zobi.commands.temporary_cache.exceptions import TemporaryCacheAccessDeniedError
from zobi.commands.temporary_cache.parameters import CommandParameters
from zobi.extensions import cache_manager
from zobi.temporary_cache.utils import cache_key
from zobi.utils.core import get_user_id


class DeleteFilterStateCommand(DeleteTemporaryCacheCommand):
    def delete(self, cmd_params: CommandParameters) -> bool:
        resource_id = cmd_params.resource_id
        key = cache_key(resource_id, cmd_params.key)
        check_access(resource_id)
        entry: Entry = cache_manager.filter_state_cache.get(key)
        if entry:
            if entry["owner"] != get_user_id():
                raise TemporaryCacheAccessDeniedError()
            tab_id = cmd_params.tab_id
            contextual_key = cache_key(session.get("_id"), tab_id, resource_id)
            cache_manager.filter_state_cache.delete(contextual_key)
            return cache_manager.filter_state_cache.delete(key)
        return False
