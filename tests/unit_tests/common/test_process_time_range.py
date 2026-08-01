from zobi.common.query_object_factory import QueryObjectFactory
from zobi.constants import NO_TIME_RANGE


def test_process_time_range():
    """
    correct empty time range
    """
    assert QueryObjectFactory._process_time_range(None) == NO_TIME_RANGE

    """
    Use the first temporal filter as time range
    """
    filters = [
        {"col": "dttm", "op": "TEMPORAL_RANGE", "val": "2001 : 2002"},
        {"col": "dttm2", "op": "TEMPORAL_RANGE", "val": "2002 : 2003"},
    ]
    assert QueryObjectFactory._process_time_range(None, filters) == "2001 : 2002"

    """
    Use the BASE_AXIS temporal filter as time range
    """
    columns = [
        {
            "columnType": "BASE_AXIS",
            "label": "dttm2",
            "sqlExpression": "dttm",
        }
    ]
    assert (
        QueryObjectFactory._process_time_range(None, filters, columns) == "2002 : 2003"
    )
