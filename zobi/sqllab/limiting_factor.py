from zobi.utils.backports import StrEnum


class LimitingFactor(StrEnum):
    QUERY = "QUERY"
    DROPDOWN = "DROPDOWN"
    QUERY_AND_DROPDOWN = "QUERY_AND_DROPDOWN"
    NOT_LIMITED = "NOT_LIMITED"
    UNKNOWN = "UNKNOWN"
