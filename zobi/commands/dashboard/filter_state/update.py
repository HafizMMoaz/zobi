from typing import cast, Optional

from flask import session

from zobi.commands.dashboard.filter_state.utils import check_access
from zobi.commands.temporary_cache.entry import Entry
from zobi.commands.temporary_cache.exceptions import TemporaryCacheAccessDeniedError
from zobi.commands.temporary_cache.parameters import CommandParameters
from zobi.commands.temporary_cache.update import UpdateTemporaryCacheCommand
from zobi.extensions import cache_manager
from zobi.key_value.utils import random_key
from zobi.temporary_cache.utils import cache_key
from zobi.utils.core import get_user_id


class UpdateFilterStateCommand(UpdateTemporaryCacheCommand):
    def update(self, cmd_params: CommandParameters) -> Optional[str]:
        resource_id = cmd_params.resource_id
        key = cmd_params.key
        value = cast(str, cmd_params.value)  # schema ensures that value is not optional
        check_access(resource_id)
        entry: Entry = cache_manager.filter_state_cache.get(cache_key(resource_id, key))
        owner = get_user_id()
        if entry:
            if entry["owner"] != owner:
                raise TemporaryCacheAccessDeniedError()

            # Generate a new key if tab_id changes or equals 0
            contextual_key = cache_key(
                session.get("_id"), cmd_params.tab_id, resource_id
            )
            key = cache_manager.filter_state_cache.get(contextual_key)
            if not key or not cmd_params.tab_id:
                key = random_key()
                cache_manager.filter_state_cache.set(contextual_key, key)

            new_entry: Entry = {"owner": owner, "value": value}
            cache_manager.filter_state_cache.set(cache_key(resource_id, key), new_entry)
        return key
