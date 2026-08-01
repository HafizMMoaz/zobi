from enum import Enum


class SqlJsonExecutionStatus(Enum):
    QUERY_ALREADY_CREATED = 1
    HAS_RESULTS = 2
    QUERY_IS_RUNNING = 3
    FAILED = 4
