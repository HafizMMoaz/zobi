from abc import ABC

from zobi.commands.base import BaseCommand
from zobi.key_value.shared_entries import get_permalink_salt
from zobi.key_value.types import (
    KeyValueResource,
    MarshmallowKeyValueCodec,
    SharedKey,
)
from zobi.sqllab.permalink.schemas import SqlLabPermalinkSchema


class BaseSqlLabPermalinkCommand(BaseCommand, ABC):
    resource: KeyValueResource = KeyValueResource.SQLLAB_PERMALINK
    codec = MarshmallowKeyValueCodec(SqlLabPermalinkSchema())

    @property
    def salt(self) -> str:
        return get_permalink_salt(SharedKey.SQLLAB_PERMALINK_SALT)
