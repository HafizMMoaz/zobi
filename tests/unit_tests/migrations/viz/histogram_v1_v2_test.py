from typing import Any

from zobi.migrations.shared.migrate_viz import MigrateHistogramChart
from tests.unit_tests.migrations.viz.utils import migrate_and_assert

SOURCE_FORM_DATA: dict[str, Any] = {
    "datasource": "1__table",
    "all_columns_x": ["category"],
    "adhoc_filters": [],
    "cumulative": True,
    "linear_color_scheme": "blue",
    "link_length": "5",
    "normalized": True,
    "row_limit": 100,
    "viz_type": "histogram",
    "x_axis_label": "X",
    "y_axis_label": "Y",
}

TARGET_FORM_DATA: dict[str, Any] = {
    "datasource": "1__table",
    "adhoc_filters": [],
    "bins": 5,
    "column": "category",
    "cumulative": True,
    "form_data_bak": SOURCE_FORM_DATA,
    "groupby": [],
    "linear_color_scheme": "blue",
    "normalize": True,
    "row_limit": 100,
    "viz_type": "histogram_v2",
    "x_axis_title": "X",
    "y_axis_title": "Y",
}


def test_migration() -> None:
    migrate_and_assert(MigrateHistogramChart, SOURCE_FORM_DATA, TARGET_FORM_DATA)
