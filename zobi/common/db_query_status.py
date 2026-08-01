from zobi.utils.backports import StrEnum


class QueryStatus(StrEnum):
    """Enum-type class for query statuses"""

    STOPPED = "stopped"
    FAILED = "failed"
    PENDING = "pending"
    RUNNING = "running"
    SCHEDULED = "scheduled"
    SUCCESS = "success"
    FETCHING = "fetching"
    TIMED_OUT = "timed_out"
