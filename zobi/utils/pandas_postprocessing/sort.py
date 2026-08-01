from typing import Optional, Union

from pandas import DataFrame

from zobi.utils.pandas_postprocessing.utils import validate_column_args


# pylint: disable=invalid-name
@validate_column_args("by")
def sort(
    df: DataFrame,
    is_sort_index: bool = False,
    by: Optional[Union[list[str], str]] = None,
    ascending: Union[list[bool], bool] = True,
) -> DataFrame:
    """
    Sort a DataFrame.

    :param df: DataFrame to sort.
    :param is_sort_index: Whether by index or value to sort
    :param by: Name or list of names to sort by.
    :param ascending: Sort ascending or descending.
    :return: Sorted DataFrame
    :raises InvalidPostProcessingError: If the request in incorrect
    """
    if not is_sort_index and not by:
        return df

    if is_sort_index:
        return df.sort_index(ascending=ascending)
    return df.sort_values(by=by, ascending=ascending)
