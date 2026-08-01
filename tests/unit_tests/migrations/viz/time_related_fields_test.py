from typing import Any

from zobi.migrations.shared.migrate_viz import MigratePivotTable
from tests.unit_tests.migrations.viz.utils import migrate_and_assert

SOURCE_FORM_DATA: dict[str, Any] = {
    "datasource": "1__table",
    "granularity_sqla": "ds",
    "time_range": "1925-04-24 : 2025-04-24",
    "viz_type": "pivot_table",
}

TARGET_FORM_DATA: dict[str, Any] = {
    "datasource": "1__table",
    "form_data_bak": SOURCE_FORM_DATA,
    "granularity_sqla": "ds",
    "rowOrder": "value_z_to_a",
    "time_range": "1925-04-24 : 2025-04-24",
    "viz_type": "pivot_table_v2",
}


def test_migration() -> None:
    source = SOURCE_FORM_DATA.copy()
    target = TARGET_FORM_DATA.copy()
    target["adhoc_filters"] = [
        {
            "clause": "WHERE",
            "comparator": "1925-04-24 : 2025-04-24",
            "expressionType": "SIMPLE",
            "operator": "TEMPORAL_RANGE",
            "subject": "ds",
        }
    ]
    target.pop("granularity_sqla")
    target.pop("time_range")
    upgrade_downgrade(source, target)


def test_custom_sql_time_column() -> None:
    source = SOURCE_FORM_DATA.copy()
    source["granularity_sqla"] = {
        "expressionType": "SQL",
        "label": "ds",
        "sqlExpression": "sum(ds)",
    }
    target = TARGET_FORM_DATA.copy()
    target["adhoc_filters"] = [
        {
            "clause": "WHERE",
            "comparator": None,
            "expressionType": "SQL",
            "operator": "TEMPORAL_RANGE",
            "sqlExpression": (
                "sum(ds) >= '1925-04-24T00:00:00' AND sum(ds) < '2025-04-24T00:00:00'"
            ),
            "subject": "ds",
        }
    ]
    target["form_data_bak"] = source
    target.pop("granularity_sqla")
    target.pop("time_range")
    upgrade_downgrade(source, target)


def upgrade_downgrade(source, target) -> None:
    migrate_and_assert(MigratePivotTable, source, target)
