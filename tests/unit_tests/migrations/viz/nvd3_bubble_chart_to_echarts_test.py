from typing import Any

from zobi.migrations.shared.migrate_viz import MigrateBubbleChart
from tests.unit_tests.migrations.viz.utils import migrate_and_assert

SOURCE_FORM_DATA: dict[str, Any] = {
    "datasource": "1__table",
    "adhoc_filters": [],
    "bottom_margin": 20,
    "color_scheme": "default",
    "entity": "count",
    "left_margin": 20,
    "limit": 100,
    "max_bubble_size": 50,
    "series": ["region"],
    "show_legend": True,
    "size": {"label": "sales", "expressionType": "SQL", "sqlExpression": "max(sales)"},
    "viz_type": "bubble",
    "x": "year",
    "x_axis_format": "SMART_DATE",
    "x_axis_label": "Year",
    "x_axis_showminmax": True,
    "x_log_scale": True,
    "x_ticks_layout": "45°",
    "y": "country",
    "y_axis_bounds": [0, 100],
    "y_axis_format": "SMART_DATE",
    "y_axis_label": "Year",
    "y_axis_showminmax": False,
    "y_log_scale": True,
}

TARGET_FORM_DATA: dict[str, Any] = {
    "datasource": "1__table",
    "adhoc_filters": [],
    "color_scheme": "default",
    "entity": "count",
    "form_data_bak": SOURCE_FORM_DATA,
    "logXAxis": True,
    "logYAxis": True,
    "max_bubble_size": 50,
    "row_limit": 100,
    "series": ["region"],
    "show_legend": True,
    "size": {"label": "sales", "expressionType": "SQL", "sqlExpression": "max(sales)"},
    "truncateYAxis": True,
    "viz_type": "bubble_v2",
    "x": "year",
    "xAxisFormat": "SMART_DATE",
    "xAxisLabelRotation": 45,
    "x_axis_label": "Year",
    "x_axis_title_margin": 20,
    "y": "country",
    "y_axis_bounds": [0, 100],
    "y_axis_format": "SMART_DATE",
    "y_axis_label": "Year",
    "y_axis_title_margin": 20,
}


def test_migration() -> None:
    migrate_and_assert(MigrateBubbleChart, SOURCE_FORM_DATA, TARGET_FORM_DATA)
