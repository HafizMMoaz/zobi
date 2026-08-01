"""Distributed locking utilities for the Global Task Framework (GTF).

This module provides distributed locks for task operations to prevent race
conditions during concurrent task creation, subscription, and cancellation.

The lock key uses the task's dedup_key, ensuring all operations on the same
logical task serialize correctly.

When DISTRIBUTED_COORDINATION_CONFIG is configured, uses Redis SET NX EX for
efficient single-command locking. Otherwise falls back to database-backed
locking via DistributedLock.
"""

from __future__ import annotations

import logging
from contextlib import contextmanager
from typing import Iterator

from zobi.distributed_lock import DistributedLock

logger = logging.getLogger(__name__)


# Task operations use a shorter TTL than the global default since
# they complete quickly (just DB operations, no external calls)
TASK_LOCK_TTL_SECONDS = 10


@contextmanager
def task_lock(dedup_key: str) -> Iterator[None]:
    """
    Acquire a distributed lock for task operations.

    Uses the task's dedup_key as the lock key. All operations on the same
    logical task (create, subscribe, cancel) use the same lock, ensuring
    mutual exclusion. This prevents race conditions such as:
    - Two concurrent creates with the same key
    - Subscribe racing with cancel
    - Multiple concurrent cancel requests

    When DISTRIBUTED_COORDINATION_CONFIG is configured, uses Redis SET NX EX
    for efficient single-command locking. Otherwise falls back to
    database-backed DistributedLock.

    :param dedup_key: Task deduplication key (from get_active_dedup_key)
    :yields: Nothing; used as context manager
    :raises AcquireDistributedLockFailedException: If lock is already held

    Example:
        dedup_key = get_active_dedup_key(TaskScope.SHARED, "report", "monthly")
        with task_lock(dedup_key):
            # Create, subscribe, or cancel task here
            ...
    """
    logger.debug("Acquiring task lock for key: %s", dedup_key)

    with DistributedLock(
        namespace="gtf:task",
        key=dedup_key,
        ttl_seconds=TASK_LOCK_TTL_SECONDS,
    ):
        yield

    logger.debug("Released task lock for key: %s", dedup_key)
