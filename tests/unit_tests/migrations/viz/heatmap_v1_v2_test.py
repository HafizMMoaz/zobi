from typing import Any

from tests.unit_tests.migrations.viz.utils import migrate_and_assert
from zobi.migrations.shared.migrate_viz import MigrateHeatmapChart

SOURCE_FORM_DATA: dict[str, Any] = {
    "datasource": "1__table",
    "any_other_key": "untouched",
    "all_columns_x": "category",
    "all_columns_y": "product",
    "metric": {
        "label": "sales",
        "expressionType": "SQL",
        "sqlExpression": "max(sales)",
    },
    "adhoc_filters": [],
    "row_limit": 100,
    "sort_by_metric": True,
    "linear_color_scheme": "blue",
    "xscale_interval": 2,
    "yscale_interval": 2,
    "canvas_image_rendering": "auto",
    "normalize_across": "x",
    "left_margin": 50,
    "bottom_margin": 50,
    "y_axis_bounds": [0, 100],
    "y_axis_format": "SMART_NUMBER",
    "currency_format": "USD",
    "sort_x_axis": "alpha_asc",
    "sort_y_axis": "alpha_asc",
    "show_legend": True,
    "show_perc": True,
    "show_values": True,
    "normalized": True,
    "viz_type": "heatmap",
}

TARGET_FORM_DATA: dict[str, Any] = {
    "datasource": "1__table",
    "any_other_key": "untouched",
    "x_axis": "category",
    "groupby": "product",
    "metric": {
        "label": "sales",
        "expressionType": "SQL",
        "sqlExpression": "max(sales)",
    },
    "adhoc_filters": [],
    "row_limit": 100,
    "legend_type": "continuous",
    "linear_color_scheme": "blue",
    "xscale_interval": 2,
    "yscale_interval": 2,
    "normalize_across": "x",
    "left_margin": 50,
    "bottom_margin": 50,
    "value_bounds": [0, 100],
    "y_axis_format": "SMART_NUMBER",
    "currency_format": "USD",
    "sort_x_axis": "alpha_asc",
    "sort_y_axis": "alpha_asc",
    "show_legend": True,
    "show_percentage": True,
    "show_values": True,
    "normalized": True,
    "viz_type": "heatmap_v2",
    "form_data_bak": SOURCE_FORM_DATA,
}


def test_migration() -> None:
    migrate_and_assert(MigrateHeatmapChart, SOURCE_FORM_DATA, TARGET_FORM_DATA)
