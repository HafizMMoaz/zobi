from abc import ABC

from zobi.commands.base import BaseCommand
from zobi.explore.permalink.schemas import ExplorePermalinkSchema
from zobi.key_value.shared_entries import get_permalink_salt
from zobi.key_value.types import (
    KeyValueResource,
    MarshmallowKeyValueCodec,
    SharedKey,
)


class BaseExplorePermalinkCommand(BaseCommand, ABC):
    resource: KeyValueResource = KeyValueResource.EXPLORE_PERMALINK
    codec = MarshmallowKeyValueCodec(ExplorePermalinkSchema())

    @property
    def salt(self) -> str:
        return get_permalink_salt(SharedKey.EXPLORE_PERMALINK_SALT)
