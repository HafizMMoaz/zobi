
from flask_babel import gettext as _
from pandas import DataFrame

from zobi.exceptions import InvalidPostProcessingError
from zobi.utils.pandas_postprocessing.utils import (
    _append_columns,
    ALLOWLIST_CUMULATIVE_FUNCTIONS,
    validate_column_args,
)


@validate_column_args("columns")
def cum(
    df: DataFrame,
    operator: str,
    columns: dict[str, str],
) -> DataFrame:
    """
    Calculate cumulative sum/product/min/max for select columns.

    :param df: DataFrame on which the cumulative operation will be based.
    :param columns: columns on which to perform a cumulative operation, mapping source
           column to target column. For instance, `{'y': 'y'}` will replace the column
           `y` with the cumulative value in `y`, while `{'y': 'y2'}` will add a column
           `y2` based on cumulative values calculated from `y`, leaving the original
           column `y` unchanged.
    :param operator: cumulative operator, e.g. `sum`, `prod`, `min`, `max`
    :return: DataFrame with cumulated columns
    """
    columns = columns or {}
    df_cum = df.loc[:, columns.keys()]
    df_cum = df_cum.fillna(0)
    operation = "cum" + operator
    if operation not in ALLOWLIST_CUMULATIVE_FUNCTIONS or not hasattr(
        df_cum, operation
    ):
        raise InvalidPostProcessingError(
            _("Invalid cumulative operator: %(operator)s", operator=operator)
        )
    df_cum = _append_columns(df, getattr(df_cum, operation)(), columns)
    return df_cum
