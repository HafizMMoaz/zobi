from typing import Optional

from pandas import DataFrame

from zobi.utils.pandas_postprocessing.utils import validate_column_args


@validate_column_args("columns", "drop", "rename")
def select(
    df: DataFrame,
    columns: Optional[list[str]] = None,
    exclude: Optional[list[str]] = None,
    rename: Optional[dict[str, str]] = None,
) -> DataFrame:
    """
    Only select a subset of columns in the original dataset. Can be useful for
    removing unnecessary intermediate results, renaming and reordering columns.

    :param df: DataFrame on which the rolling period will be based.
    :param columns: Columns which to select from the DataFrame, in the desired order.
                    If left undefined, all columns will be selected. If columns are
                    renamed, the original column name should be referenced here.
    :param exclude: columns to exclude from selection. If columns are renamed, the new
                    column name should be referenced here.
    :param rename: columns which to rename, mapping source column to target column.
                   For instance, `{'y': 'y2'}` will rename the column `y` to
                   `y2`.
    :return: Subset of columns in original DataFrame
    :raises InvalidPostProcessingError: If the request in incorrect
    """
    df_select = df.copy(deep=False)
    if columns:
        df_select = df_select[columns]
    if exclude:
        df_select = df_select.drop(exclude, axis=1)
    if rename is not None:
        df_select = df_select.rename(columns=rename)
    return df_select
