from abc import ABC

from zobi.commands.base import BaseCommand
from zobi.dashboards.permalink.schemas import DashboardPermalinkSchema
from zobi.key_value.shared_entries import get_permalink_salt
from zobi.key_value.types import (
    KeyValueResource,
    MarshmallowKeyValueCodec,
    SharedKey,
)


class BaseDashboardPermalinkCommand(BaseCommand, ABC):
    resource = KeyValueResource.DASHBOARD_PERMALINK
    codec = MarshmallowKeyValueCodec(DashboardPermalinkSchema())

    @property
    def salt(self) -> str:
        return get_permalink_salt(SharedKey.DASHBOARD_PERMALINK_SALT)
