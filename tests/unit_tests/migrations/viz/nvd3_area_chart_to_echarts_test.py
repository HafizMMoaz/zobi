from typing import Any

from tests.unit_tests.migrations.viz.utils import (
    migrate_and_assert,
    TIMESERIES_SOURCE_FORM_DATA,
    TIMESERIES_TARGET_FORM_DATA,
)
from zobi.migrations.shared.migrate_viz import MigrateAreaChart

SOURCE_FORM_DATA: dict[str, Any] = {
    "viz_type": "area",
    "stacked_style": "stream",
}

TARGET_FORM_DATA: dict[str, Any] = {
    "form_data_bak": SOURCE_FORM_DATA,
    "viz_type": "echarts_area",
    "opacity": 0.7,
    "stack": "Stream",
}


def test_migration() -> None:
    SOURCE_FORM_DATA.update(TIMESERIES_SOURCE_FORM_DATA)
    TARGET_FORM_DATA.update(TIMESERIES_TARGET_FORM_DATA)
    migrate_and_assert(MigrateAreaChart, SOURCE_FORM_DATA, TARGET_FORM_DATA)
