import pytest

from zobi.exceptions import InvalidPostProcessingError
from zobi.utils.pandas_postprocessing import diff
from tests.unit_tests.fixtures.dataframes import timeseries_df, timeseries_df2
from tests.unit_tests.pandas_postprocessing.utils import series_to_list


def test_diff():
    # overwrite column
    post_df = diff(df=timeseries_df, columns={"y": "y"})
    assert post_df.columns.tolist() == ["label", "y"]
    assert series_to_list(post_df["y"]) == [None, 1.0, 1.0, 1.0]

    # add column
    post_df = diff(df=timeseries_df, columns={"y": "y1"})
    assert post_df.columns.tolist() == ["label", "y", "y1"]
    assert series_to_list(post_df["y"]) == [1.0, 2.0, 3.0, 4.0]
    assert series_to_list(post_df["y1"]) == [None, 1.0, 1.0, 1.0]

    # look ahead
    post_df = diff(df=timeseries_df, columns={"y": "y1"}, periods=-1)
    assert series_to_list(post_df["y1"]) == [-1.0, -1.0, -1.0, None]

    # invalid column reference
    with pytest.raises(InvalidPostProcessingError):
        diff(
            df=timeseries_df,
            columns={"abc": "abc"},
        )

    # diff by columns
    post_df = diff(df=timeseries_df2, columns={"y": "y", "z": "z"}, axis=1)
    assert post_df.columns.tolist() == ["label", "y", "z"]
    assert series_to_list(post_df["z"]) == [0.0, 2.0, 8.0, 6.0]
