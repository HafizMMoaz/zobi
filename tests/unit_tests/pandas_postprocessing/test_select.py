import pytest

from zobi.exceptions import InvalidPostProcessingError
from zobi.utils.pandas_postprocessing.select import select
from tests.unit_tests.fixtures.dataframes import timeseries_df


def test_select():
    # reorder columns
    post_df = select(df=timeseries_df, columns=["y", "label"])
    assert post_df.columns.tolist() == ["y", "label"]

    # one column
    post_df = select(df=timeseries_df, columns=["label"])
    assert post_df.columns.tolist() == ["label"]

    # rename and select one column
    post_df = select(df=timeseries_df, columns=["y"], rename={"y": "y1"})
    assert post_df.columns.tolist() == ["y1"]

    # rename one and leave one unchanged
    post_df = select(df=timeseries_df, rename={"y": "y1"})
    assert post_df.columns.tolist() == ["label", "y1"]

    # drop one column
    post_df = select(df=timeseries_df, exclude=["label"])
    assert post_df.columns.tolist() == ["y"]

    # rename and drop one column
    post_df = select(df=timeseries_df, rename={"y": "y1"}, exclude=["label"])
    assert post_df.columns.tolist() == ["y1"]

    # invalid columns
    with pytest.raises(InvalidPostProcessingError):
        select(df=timeseries_df, columns=["abc"], rename={"abc": "qwerty"})

    # select renamed column by new name
    with pytest.raises(InvalidPostProcessingError):
        select(df=timeseries_df, columns=["label_new"], rename={"label": "label_new"})
