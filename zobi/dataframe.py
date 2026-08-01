"""Zobi utilities for pandas.DataFrame."""

import logging
from typing import Any

import pandas as pd

from zobi.utils.core import JS_MAX_INTEGER

logger = logging.getLogger(__name__)


def _convert_big_integers(val: Any) -> Any:
    """
    Cast integers larger than ``JS_MAX_INTEGER`` to strings.

    :param val: the value to process
    :returns: the same value but recast as a string if it was an integer over
        ``JS_MAX_INTEGER``
    """
    return str(val) if isinstance(val, int) and abs(val) > JS_MAX_INTEGER else val


def df_to_records(dframe: pd.DataFrame) -> list[dict[str, Any]]:
    """
    Convert a DataFrame to a set of records.

    NaN values are converted to None for JSON compatibility.
    This handles division by zero and other operations that produce NaN.

    :param dframe: the DataFrame to convert
    :returns: a list of dictionaries reflecting each single row of the DataFrame
    """
    if not dframe.columns.is_unique:
        logger.warning(
            "DataFrame columns are not unique, some columns will be omitted."
        )
    records = dframe.to_dict(orient="records")

    for record in records:
        for key in record:
            record[key] = (
                None if pd.isna(record[key]) else _convert_big_integers(record[key])
            )

    return records
