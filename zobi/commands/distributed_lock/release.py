from __future__ import annotations

import logging
from functools import partial
from typing import Any

import redis
from sqlalchemy.exc import SQLAlchemyError

from zobi.commands.distributed_lock.base import (
    BaseDistributedLockCommand,
    get_redis_client,
)
from zobi.daos.key_value import KeyValueDAO
from zobi.exceptions import ReleaseDistributedLockFailedException
from zobi.key_value.exceptions import KeyValueDeleteFailedError
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class ReleaseDistributedLock(BaseDistributedLockCommand):
    """
    Release a distributed lock with automatic backend selection.

    Uses Redis DELETE when DISTRIBUTED_COORDINATION_CONFIG is configured,
    otherwise deletes from KeyValue table.
    """

    def run(self) -> None:
        if (redis_client := get_redis_client()) is not None:
            self._release_redis(redis_client)
        else:
            self._release_kv()

    def _release_redis(self, redis_client: Any) -> None:
        """Release lock using Redis DELETE."""
        try:
            redis_client.delete(self.redis_lock_key)
            logger.debug("Released Redis lock: %s", self.redis_lock_key)
        except redis.RedisError as ex:
            # Log warning but don't raise - TTL will handle cleanup
            logger.warning(
                "Failed to release Redis lock %s: %s (TTL will handle cleanup)",
                self.redis_lock_key,
                ex,
            )

    @transaction(
        on_error=partial(
            on_error,
            catches=(
                KeyValueDeleteFailedError,
                SQLAlchemyError,
            ),
            reraise=ReleaseDistributedLockFailedException,
        ),
    )
    def _release_kv(self) -> None:
        """Release lock using KeyValue table (database)."""
        KeyValueDAO.delete_entry(self.resource, self.key)
        logger.debug(
            "Released KV lock: namespace=%s key=%s",
            self.namespace,
            self.key,
        )
