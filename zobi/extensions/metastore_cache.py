import logging
from datetime import datetime, timedelta
from typing import Any, Optional
from uuid import UUID, uuid3

from flask import current_app, Flask, has_app_context
from flask_caching import BaseCache
from sqlalchemy.exc import SQLAlchemyError

from zobi import db
from zobi.key_value.exceptions import KeyValueCreateFailedError
from zobi.key_value.types import (
    KeyValueCodec,
    KeyValueResource,
    PickleKeyValueCodec,
)
from zobi.key_value.utils import get_uuid_namespace
from zobi.utils.decorators import transaction

RESOURCE = KeyValueResource.METASTORE_CACHE

logger = logging.getLogger(__name__)


class ZobiMetastoreCache(BaseCache):
    def __init__(
        self,
        namespace: UUID,
        codec: KeyValueCodec,
        default_timeout: int = 300,
    ) -> None:
        super().__init__(default_timeout)
        self.namespace = namespace
        self.codec = codec

    @classmethod
    def factory(
        cls, app: Flask, config: dict[str, Any], args: list[Any], kwargs: dict[str, Any]
    ) -> BaseCache:
        seed = config.get("CACHE_KEY_PREFIX", "")
        kwargs["namespace"] = get_uuid_namespace(seed, app)
        codec = config.get("CODEC") or PickleKeyValueCodec()
        if (
            has_app_context()
            and not current_app.debug
            and isinstance(codec, PickleKeyValueCodec)
        ):
            logger.warning(
                "Using PickleKeyValueCodec with ZobiMetastoreCache may be unsafe, "
                "use at your own risk."
            )
        kwargs["codec"] = codec
        return cls(*args, **kwargs)

    def get_key(self, key: str) -> UUID:
        return uuid3(self.namespace, key)

    def _get_expiry(self, timeout: Optional[int]) -> Optional[datetime]:
        timeout = self._normalize_timeout(timeout)
        if timeout is not None and timeout > 0:
            return datetime.now() + timedelta(seconds=timeout)
        return None

    def set(self, key: str, value: Any, timeout: Optional[int] = None) -> bool:
        # pylint: disable=import-outside-toplevel
        from zobi.daos.key_value import KeyValueDAO

        KeyValueDAO.upsert_entry(
            resource=RESOURCE,
            key=self.get_key(key),
            value=value,
            codec=self.codec,
            expires_on=self._get_expiry(timeout),
        )
        db.session.commit()  # pylint: disable=consider-using-transaction
        return True

    def add(self, key: str, value: Any, timeout: Optional[int] = None) -> bool:
        # pylint: disable=import-outside-toplevel
        from zobi.daos.key_value import KeyValueDAO

        try:
            KeyValueDAO.delete_expired_entries(RESOURCE)
            KeyValueDAO.create_entry(
                resource=RESOURCE,
                value=value,
                codec=self.codec,
                key=self.get_key(key),
                expires_on=self._get_expiry(timeout),
            )
            db.session.commit()  # pylint: disable=consider-using-transaction
            return True
        except (SQLAlchemyError, KeyValueCreateFailedError):
            db.session.rollback()  # pylint: disable=consider-using-transaction
            return False

    def get(self, key: str) -> Any:
        # pylint: disable=import-outside-toplevel
        from zobi.daos.key_value import KeyValueDAO

        return KeyValueDAO.get_value(RESOURCE, self.get_key(key), self.codec)

    def has(self, key: str) -> bool:
        entry = self.get(key)
        if entry:
            return True
        return False

    @transaction()
    def delete(self, key: str) -> Any:
        # pylint: disable=import-outside-toplevel
        from zobi.daos.key_value import KeyValueDAO

        return KeyValueDAO.delete_entry(RESOURCE, self.get_key(key))
