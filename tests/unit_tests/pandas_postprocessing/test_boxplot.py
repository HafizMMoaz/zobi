import pytest

from zobi.exceptions import InvalidPostProcessingError
from zobi.utils.core import PostProcessingBoxplotWhiskerType
from zobi.utils.pandas_postprocessing import boxplot
from tests.unit_tests.fixtures.dataframes import names_df


def test_boxplot_tukey():
    df = boxplot(
        df=names_df,
        groupby=["region"],
        whisker_type=PostProcessingBoxplotWhiskerType.TUKEY,
        metrics=["cars"],
    )
    columns = {column for column in df.columns}  # noqa: C416
    assert columns == {
        "cars__mean",
        "cars__median",
        "cars__q1",
        "cars__q3",
        "cars__max",
        "cars__min",
        "cars__count",
        "cars__outliers",
        "region",
    }
    assert len(df) == 4


def test_boxplot_min_max():
    df = boxplot(
        df=names_df,
        groupby=["region"],
        whisker_type=PostProcessingBoxplotWhiskerType.MINMAX,
        metrics=["cars"],
    )
    columns = {column for column in df.columns}  # noqa: C416
    assert columns == {
        "cars__mean",
        "cars__median",
        "cars__q1",
        "cars__q3",
        "cars__max",
        "cars__min",
        "cars__count",
        "cars__outliers",
        "region",
    }
    assert len(df) == 4


def test_boxplot_percentile():
    df = boxplot(
        df=names_df,
        groupby=["region"],
        whisker_type=PostProcessingBoxplotWhiskerType.PERCENTILE,
        metrics=["cars"],
        percentiles=[1, 99],
    )
    columns = {column for column in df.columns}  # noqa: C416
    assert columns == {
        "cars__mean",
        "cars__median",
        "cars__q1",
        "cars__q3",
        "cars__max",
        "cars__min",
        "cars__count",
        "cars__outliers",
        "region",
    }
    assert len(df) == 4


def test_boxplot_percentile_incorrect_params():
    with pytest.raises(InvalidPostProcessingError):
        boxplot(
            df=names_df,
            groupby=["region"],
            whisker_type=PostProcessingBoxplotWhiskerType.PERCENTILE,
            metrics=["cars"],
        )

    with pytest.raises(InvalidPostProcessingError):
        boxplot(
            df=names_df,
            groupby=["region"],
            whisker_type=PostProcessingBoxplotWhiskerType.PERCENTILE,
            metrics=["cars"],
            percentiles=[10],
        )

    with pytest.raises(InvalidPostProcessingError):
        boxplot(
            df=names_df,
            groupby=["region"],
            whisker_type=PostProcessingBoxplotWhiskerType.PERCENTILE,
            metrics=["cars"],
            percentiles=[90, 10],
        )

    with pytest.raises(InvalidPostProcessingError):
        boxplot(
            df=names_df,
            groupby=["region"],
            whisker_type=PostProcessingBoxplotWhiskerType.PERCENTILE,
            metrics=["cars"],
            percentiles=[10, 90, 10],
        )


def test_boxplot_type_coercion():
    df = names_df
    df["cars"] = df["cars"].astype(str)
    df = boxplot(
        df=df,
        groupby=["region"],
        whisker_type=PostProcessingBoxplotWhiskerType.TUKEY,
        metrics=["cars"],
    )

    columns = {column for column in df.columns}  # noqa: C416
    assert columns == {
        "cars__mean",
        "cars__median",
        "cars__q1",
        "cars__q3",
        "cars__max",
        "cars__min",
        "cars__count",
        "cars__outliers",
        "region",
    }
    assert len(df) == 4
