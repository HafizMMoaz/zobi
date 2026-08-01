import logging
from typing import Optional

from zobi import db
from zobi.commands.dataset.exceptions import DatasetNotFoundError
from zobi.commands.sql_lab.permalink.base import BaseSqlLabPermalinkCommand
from zobi.daos.key_value import KeyValueDAO
from zobi.key_value.exceptions import (
    KeyValueCodecDecodeException,
    KeyValueGetFailedError,
    KeyValueParseKeyError,
)
from zobi.key_value.utils import decode_permalink_id
from zobi.models import core as models
from zobi.sqllab.permalink.exceptions import SqlLabPermalinkGetFailedError
from zobi.sqllab.permalink.types import SqlLabPermalinkValue
from zobi.utils import core as utils, json

logger = logging.getLogger(__name__)


class GetSqlLabPermalinkCommand(BaseSqlLabPermalinkCommand):
    def __init__(self, key: str):
        self.key = key

    def run(self) -> Optional[SqlLabPermalinkValue]:
        self.validate()
        if self.key.startswith("kv:"):
            id = int(self.key[3:])
            try:
                kv = db.session.query(models.KeyValue).filter_by(id=id).scalar()
                if not kv:
                    return None
                return json.loads(kv.value)
            except Exception as ex:
                raise SqlLabPermalinkGetFailedError(
                    message=utils.error_msg_from_exception(ex)
                ) from ex

        try:
            key = decode_permalink_id(self.key, salt=self.salt)
            value = KeyValueDAO.get_value(self.resource, key, self.codec)
            if value:
                return value
            return None
        except (
            DatasetNotFoundError,
            KeyValueCodecDecodeException,
            KeyValueGetFailedError,
            KeyValueParseKeyError,
        ) as ex:
            raise SqlLabPermalinkGetFailedError(message=ex.message) from ex

    def validate(self) -> None:
        pass
