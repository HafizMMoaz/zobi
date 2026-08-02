from __future__ import annotations

import logging
import uuid
from typing import Any, TYPE_CHECKING

from flask import current_app

from zobi.commands.base import BaseCommand
from zobi.distributed_lock.utils import get_key
from zobi.extensions import cache_manager
from zobi.key_value.types import JsonKeyValueCodec, KeyValueResource

if TYPE_CHECKING:
    import redis

logger = logging.getLogger(__name__)


def get_default_lock_ttl() -> int:
    """Get the default lock TTL from config."""
    return int(current_app.config.get("DISTRIBUTED_LOCK_DEFAULT_TTL", 30))


def get_redis_client() -> "redis.Redis[Any] | None":
    """
    Get Redis client from distributed coordination if available.

    Returns None if DISTRIBUTED_COORDINATION_CONFIG is not configured,
    allowing fallback to database-backed locking.
    """
    backend = cache_manager.distributed_coordination
    return backend._cache if backend else None


class BaseDistributedLockCommand(BaseCommand):
    """Base command for distributed lock operations."""

    key: uuid.UUID
    namespace: str
    codec = JsonKeyValueCodec()
    resource = KeyValueResource.LOCK

    def __init__(self, namespace: str, params: dict[str, Any] | None = None) -> None:
        self.namespace = namespace
        self.params = params or {}
        self.key = get_key(namespace, **self.params)

    @property
    def redis_lock_key(self) -> str:
        """Redis key for this lock."""
        return f"lock:{self.namespace}:{self.key}"

    def validate(self) -> None:
        pass
