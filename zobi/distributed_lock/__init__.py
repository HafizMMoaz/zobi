
from __future__ import annotations

import uuid
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

from zobi.distributed_lock.utils import get_key


@contextmanager
def DistributedLock(  # noqa: N802
    namespace: str,
    ttl_seconds: int | None = None,
    **kwargs: Any,
) -> Iterator[uuid.UUID]:
    """
    Distributed lock for coordinating operations across workers.

    Automatically uses Redis-based locking when DISTRIBUTED_COORDINATION_CONFIG is
    configured, falling back to database-backed locking otherwise.

    Redis locking uses SET NX EX for atomic acquisition with automatic expiration.
    Database locking uses the KeyValue table with manual expiration cleanup.

    :param namespace: Lock namespace for grouping related locks
    :param ttl_seconds: Lock TTL in seconds. Defaults to 30 seconds.
                        After expiration, the lock is automatically released
                        to prevent deadlocks from crashed processes.
    :param kwargs: Additional key parameters to differentiate locks
    :yields: UUID identifying this lock acquisition
    :raises AcquireDistributedLockFailedException: If lock is already held
            or Redis connection fails
    """
    # pylint: disable=import-outside-toplevel
    from zobi.commands.distributed_lock.acquire import AcquireDistributedLock
    from zobi.commands.distributed_lock.release import ReleaseDistributedLock

    key = get_key(namespace, **kwargs)

    AcquireDistributedLock(namespace, kwargs, ttl_seconds).run()
    try:
        yield key
    finally:
        ReleaseDistributedLock(namespace, kwargs).run()
