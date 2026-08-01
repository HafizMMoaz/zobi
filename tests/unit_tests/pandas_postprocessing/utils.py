import math
from typing import Any, Optional

from pandas import Series

AGGREGATES_SINGLE = {"idx_nulls": {"operator": "sum"}}
AGGREGATES_MULTIPLE = {
    "idx_nulls": {"operator": "sum"},
    "asc_idx": {"operator": "mean"},
}


def series_to_list(series: Series) -> list[Any]:
    """
    Converts a `Series` to a regular list, and replaces non-numeric values to
    Nones.

    :param series: Series to convert
    :return: list without nan or inf
    """
    return [
        None
        if not isinstance(val, str) and (math.isnan(val) or math.isinf(val))
        else val
        for val in series.tolist()
    ]


def round_floats(
    floats: list[Optional[float]], precision: int
) -> list[Optional[float]]:
    """
    Round list of floats to certain precision

    :param floats: floats to round
    :param precision: intended decimal precision
    :return: rounded floats
    """
    return [round(val, precision) if val else None for val in floats]
