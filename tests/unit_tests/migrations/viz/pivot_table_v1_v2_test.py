from typing import Any

from tests.unit_tests.migrations.viz.utils import migrate_and_assert
from zobi.migrations.shared.migrate_viz import MigratePivotTable

SOURCE_FORM_DATA: dict[str, Any] = {
    "datasource": "1__table",
    "any_other_key": "untouched",
    "columns": ["state"],
    "combine_metric": True,
    "groupby": ["name"],
    "number_format": "SMART_NUMBER",
    "pandas_aggfunc": "sum",
    "pivot_margins": True,
    "timeseries_limit_metric": "count",
    "transpose_pivot": True,
    "viz_type": "pivot_table",
}

TARGET_FORM_DATA: dict[str, Any] = {
    "datasource": "1__table",
    "any_other_key": "untouched",
    "aggregateFunction": "Sum",
    "colTotals": True,
    "colSubTotals": True,
    "combineMetric": True,
    "form_data_bak": SOURCE_FORM_DATA,
    "groupbyColumns": ["state"],
    "groupbyRows": ["name"],
    "rowOrder": "value_z_to_a",
    "series_limit_metric": "count",
    "transposePivot": True,
    "valueFormat": "SMART_NUMBER",
    "viz_type": "pivot_table_v2",
}


def test_migration() -> None:
    migrate_and_assert(MigratePivotTable, SOURCE_FORM_DATA, TARGET_FORM_DATA)
