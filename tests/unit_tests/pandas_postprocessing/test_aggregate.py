from tests.unit_tests.fixtures.dataframes import categories_df
from tests.unit_tests.pandas_postprocessing.utils import series_to_list
from zobi.utils.pandas_postprocessing import aggregate


def test_aggregate():
    aggregates = {
        "asc sum": {"column": "asc_idx", "operator": "sum"},
        "asc q2": {
            "column": "asc_idx",
            "operator": "percentile",
            "options": {"q": 75},
        },
        "desc q1": {
            "column": "desc_idx",
            "operator": "percentile",
            "options": {"q": 25},
        },
    }
    df = aggregate(df=categories_df, groupby=["constant"], aggregates=aggregates)
    assert df.columns.tolist() == ["constant", "asc sum", "asc q2", "desc q1"]
    assert series_to_list(df["asc sum"])[0] == 5050
    assert series_to_list(df["asc q2"])[0] == 75
    assert series_to_list(df["desc q1"])[0] == 25
