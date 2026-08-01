import logging
from typing import Optional

from sqlalchemy.exc import SQLAlchemyError

from zobi.commands.dashboard.exceptions import DashboardNotFoundError
from zobi.commands.dashboard.permalink.base import BaseDashboardPermalinkCommand
from zobi.daos.dashboard import DashboardDAO
from zobi.daos.key_value import KeyValueDAO
from zobi.dashboards.permalink.exceptions import DashboardPermalinkGetFailedError
from zobi.dashboards.permalink.types import DashboardPermalinkValue
from zobi.key_value.exceptions import (
    KeyValueCodecDecodeException,
    KeyValueGetFailedError,
    KeyValueParseKeyError,
)
from zobi.key_value.utils import decode_permalink_id

logger = logging.getLogger(__name__)


class GetDashboardPermalinkCommand(BaseDashboardPermalinkCommand):
    def __init__(self, key: str):
        self.key = key

    def run(self) -> Optional[DashboardPermalinkValue]:
        self.validate()
        try:
            key = decode_permalink_id(self.key, salt=self.salt)
            value = KeyValueDAO.get_value(self.resource, key, self.codec)
            if value:
                DashboardDAO.get_by_id_or_slug(value["dashboardId"])
                return value
            return None
        except (
            DashboardNotFoundError,
            KeyValueCodecDecodeException,
            KeyValueGetFailedError,
            KeyValueParseKeyError,
        ) as ex:
            raise DashboardPermalinkGetFailedError(message=ex.message) from ex
        except SQLAlchemyError as ex:
            logger.exception("Error running get command")
            raise DashboardPermalinkGetFailedError() from ex

    def validate(self) -> None:
        pass
