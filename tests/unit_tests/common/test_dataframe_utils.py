import datetime

import pandas as pd

from zobi.common.utils import dataframe_utils


def test_is_datetime_series():
    assert not dataframe_utils.is_datetime_series(None)
    assert not dataframe_utils.is_datetime_series(pd.DataFrame({"foo": [1]}))
    assert not dataframe_utils.is_datetime_series(pd.Series([1, 2, 3]))
    assert not dataframe_utils.is_datetime_series(pd.Series(["1", "2", "3"]))
    assert not dataframe_utils.is_datetime_series(pd.Series())
    assert not dataframe_utils.is_datetime_series(pd.Series([None, None]))
    assert dataframe_utils.is_datetime_series(
        pd.Series([datetime.date(2018, 1, 1), datetime.date(2018, 1, 2), None])
    )
    assert dataframe_utils.is_datetime_series(
        pd.Series([datetime.date(2018, 1, 1), datetime.date(2018, 1, 2)])
    )
    assert dataframe_utils.is_datetime_series(
        pd.Series([datetime.datetime(2018, 1, 1), datetime.datetime(2018, 1, 2), None])
    )
    assert dataframe_utils.is_datetime_series(
        pd.Series([datetime.datetime(2018, 1, 1), datetime.datetime(2018, 1, 2)])
    )
    assert dataframe_utils.is_datetime_series(
        pd.date_range(datetime.date(2018, 1, 1), datetime.date(2018, 2, 1)).to_series()
    )
    assert dataframe_utils.is_datetime_series(
        pd.date_range(
            datetime.datetime(2018, 1, 1), datetime.datetime(2018, 2, 1)
        ).to_series()
    )
