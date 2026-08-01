"""Constants for the Global Task Framework (GTF)."""

from zobi_core.tasks.types import TaskStatus

# Terminal states: Task execution has ended and dedup_key slot is freed
TERMINAL_STATES: frozenset[str] = frozenset(
    {
        TaskStatus.SUCCESS.value,
        TaskStatus.FAILURE.value,
        TaskStatus.ABORTED.value,
        TaskStatus.TIMED_OUT.value,
    }
)

# Active states: Task is still in progress and dedup_key is reserved
ACTIVE_STATES: frozenset[str] = frozenset(
    {
        TaskStatus.PENDING.value,
        TaskStatus.IN_PROGRESS.value,
        TaskStatus.ABORTING.value,
    }
)

# Abortable states: Task can be aborted (for pending or abortable in-progress)
ABORTABLE_STATES: frozenset[str] = frozenset(
    {
        TaskStatus.PENDING.value,
        TaskStatus.IN_PROGRESS.value,
    }
)

# Abort-related states: Task is being or has been aborted
ABORT_STATES: frozenset[str] = frozenset(
    {
        TaskStatus.ABORTING.value,
        TaskStatus.ABORTED.value,
    }
)
