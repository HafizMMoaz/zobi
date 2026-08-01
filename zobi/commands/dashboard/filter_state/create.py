from typing import cast

from flask import session

from zobi.commands.dashboard.filter_state.utils import check_access
from zobi.commands.temporary_cache.create import CreateTemporaryCacheCommand
from zobi.commands.temporary_cache.entry import Entry
from zobi.commands.temporary_cache.parameters import CommandParameters
from zobi.extensions import cache_manager
from zobi.key_value.utils import random_key
from zobi.temporary_cache.utils import cache_key
from zobi.utils.core import get_user_id


class CreateFilterStateCommand(CreateTemporaryCacheCommand):
    def create(self, cmd_params: CommandParameters) -> str:
        resource_id = cmd_params.resource_id
        tab_id = cmd_params.tab_id
        contextual_key = cache_key(session.get("_id"), tab_id, resource_id)
        key = cache_manager.filter_state_cache.get(contextual_key)
        if not key or not tab_id:
            key = random_key()
        value = cast(str, cmd_params.value)  # schema ensures that value is not optional
        check_access(resource_id)
        entry: Entry = {"owner": get_user_id(), "value": value}
        cache_manager.filter_state_cache.set(cache_key(resource_id, key), entry)
        cache_manager.filter_state_cache.set(contextual_key, key)
        return key
