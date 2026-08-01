from __future__ import annotations

import datetime
from typing import Any, TYPE_CHECKING

import numpy as np
import pandas as pd

if TYPE_CHECKING:
    from zobi.common.query_object import QueryObject


def left_join_df(
    left_df: pd.DataFrame,
    right_df: pd.DataFrame,
    join_keys: list[str],
    lsuffix: str = "",
    rsuffix: str = "",
) -> pd.DataFrame:
    df = left_df.set_index(join_keys).join(
        right_df.set_index(join_keys), lsuffix=lsuffix, rsuffix=rsuffix
    )
    df.reset_index(inplace=True)
    return df


def full_outer_join_df(
    left_df: pd.DataFrame,
    right_df: pd.DataFrame,
    lsuffix: str = "",
    rsuffix: str = "",
) -> pd.DataFrame:
    df = left_df.join(right_df, lsuffix=lsuffix, rsuffix=rsuffix, how="outer")
    df.reset_index(inplace=True)
    return df


def df_metrics_to_num(df: pd.DataFrame, query_object: QueryObject) -> None:
    """Converting metrics to numeric when pandas.read_sql cannot"""
    for col, dtype in df.dtypes.items():
        if dtype.type == np.object_ and col in query_object.metric_names:
            # soft-convert a metric column to numeric
            # will stay as strings if conversion fails
            df[col] = df[col].infer_objects()


def is_datetime_series(series: Any) -> bool:
    if series is None or not isinstance(series, pd.Series):
        return False

    if series.isnull().all():
        return False

    return pd.api.types.is_datetime64_any_dtype(series) or (
        series.apply(lambda x: isinstance(x, datetime.date) or x is None).all()
    )
