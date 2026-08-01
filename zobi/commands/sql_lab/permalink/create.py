import logging
from functools import partial
from typing import Any

from sqlalchemy.exc import SQLAlchemyError

from zobi import db
from zobi.commands.sql_lab.permalink.base import BaseSqlLabPermalinkCommand
from zobi.daos.key_value import KeyValueDAO
from zobi.key_value.exceptions import (
    KeyValueCodecEncodeException,
    KeyValueCreateFailedError,
)
from zobi.key_value.utils import encode_permalink_key
from zobi.sqllab.permalink.exceptions import SqlLabPermalinkCreateFailedError
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class CreateSqlLabPermalinkCommand(BaseSqlLabPermalinkCommand):
    def __init__(self, state: dict[str, Any]):
        self._properties = state.copy()

    @transaction(
        on_error=partial(
            on_error,
            catches=(
                KeyValueCodecEncodeException,
                KeyValueCreateFailedError,
                SQLAlchemyError,
            ),
            reraise=SqlLabPermalinkCreateFailedError,
        ),
    )
    def run(self) -> str:
        self.validate()
        entry = KeyValueDAO.create_entry(self.resource, self._properties, self.codec)
        db.session.flush()
        key = entry.id
        if key is None:
            raise SqlLabPermalinkCreateFailedError("Unexpected missing key id")
        return encode_permalink_key(key=key, salt=self.salt)

    def validate(self) -> None:
        pass
