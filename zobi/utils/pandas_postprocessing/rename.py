from typing import Optional, Union

import pandas as pd
from flask_babel import gettext as _
from pandas._typing import Level

from zobi.exceptions import InvalidPostProcessingError
from zobi.utils.pandas_postprocessing.utils import validate_column_args


@validate_column_args("columns")
def rename(
    df: pd.DataFrame,
    columns: dict[str, Union[str, None]],
    inplace: bool = False,
    level: Optional[Level] = None,
) -> pd.DataFrame:
    """
    Alter column name of DataFrame

    :param df: DataFrame to rename.
    :param columns: The offset string representing target conversion.
    :param inplace: Whether to return a new DataFrame.
    :param level: In case of a MultiIndex, only rename labels in the specified level.
    :return: DataFrame after rename
    :raises InvalidPostProcessingError: If the request is unexpected
    """
    if not columns:
        return df

    try:
        _rename_level = df.columns.get_level_values(level=level)
    except (IndexError, KeyError) as err:
        raise InvalidPostProcessingError from err

    if all(new_name in _rename_level for new_name in columns.values()):
        raise InvalidPostProcessingError(_("Label already exists"))

    if inplace:
        df.rename(columns=columns, inplace=inplace, level=level)
        return df
    return df.rename(columns=columns, inplace=inplace, level=level)
