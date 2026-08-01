from typing import Any

from pandas import DataFrame

from zobi.utils.pandas_postprocessing.utils import (
    _get_aggregate_funcs,
    validate_column_args,
)


@validate_column_args("groupby")
def aggregate(
    df: DataFrame, groupby: list[str], aggregates: dict[str, dict[str, Any]]
) -> DataFrame:
    """
    Apply aggregations to a DataFrame.

    :param df: Object to aggregate.
    :param groupby: columns to aggregate
    :param aggregates: A mapping from metric column to the function used to
           aggregate values.
    :raises InvalidPostProcessingError: If the request in incorrect
    """
    aggregates = aggregates or {}
    aggregate_funcs = _get_aggregate_funcs(df, aggregates)
    if groupby:
        df_groupby = df.groupby(by=groupby)
    else:
        df_groupby = df.groupby(lambda _: True)
    return df_groupby.agg(**aggregate_funcs).reset_index(drop=not groupby)
