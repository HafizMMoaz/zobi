
from pandas import DataFrame

from zobi.constants import PandasAxis
from zobi.utils.pandas_postprocessing.utils import (
    _append_columns,
    validate_column_args,
)


@validate_column_args("columns")
def diff(
    df: DataFrame,
    columns: dict[str, str],
    periods: int = 1,
    axis: PandasAxis = PandasAxis.ROW,
) -> DataFrame:
    """
    Calculate row-by-row or column-by-column difference for select columns.

    :param df: DataFrame on which the diff will be based.
    :param columns: columns on which to perform diff, mapping source column to
           target column. For instance, `{'y': 'y'}` will replace the column `y` with
           the diff value in `y`, while `{'y': 'y2'}` will add a column `y2` based
           on diff values calculated from `y`, leaving the original column `y`
           unchanged.
    :param periods: periods to shift for calculating difference.
    :param axis: 0 for row, 1 for column. default 0.
    :return: DataFrame with diffed columns
    :raises InvalidPostProcessingError: If the request in incorrect
    """
    df_diff = df[columns.keys()]
    df_diff = df_diff.diff(periods=periods, axis=axis)
    return _append_columns(df, df_diff, columns)
