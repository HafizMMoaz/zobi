from typing import Any

from zobi.migrations.shared.migrate_viz import MigrateLineChart
from tests.unit_tests.migrations.viz.utils import (
    migrate_and_assert,
    TIMESERIES_SOURCE_FORM_DATA,
    TIMESERIES_TARGET_FORM_DATA,
)

SOURCE_FORM_DATA: dict[str, Any] = {
    "viz_type": "line",
}

TARGET_FORM_DATA: dict[str, Any] = {
    "form_data_bak": SOURCE_FORM_DATA,
    "viz_type": "echarts_timeseries_line",
}


def test_migration() -> None:
    SOURCE_FORM_DATA.update(TIMESERIES_SOURCE_FORM_DATA)
    TARGET_FORM_DATA.update(TIMESERIES_TARGET_FORM_DATA)
    migrate_and_assert(MigrateLineChart, SOURCE_FORM_DATA, TARGET_FORM_DATA)
