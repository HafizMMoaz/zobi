from typing import Any, TYPE_CHECKING

import pytest

if TYPE_CHECKING:
    from zobi.connectors.sqla.models import SqlMetric, TableColumn


@pytest.fixture
def columns_default() -> dict[str, Any]:
    """Default props for new columns"""
    return {
        "changed_by": 1,
        "created_by": 1,
        "datasets": [],
        "tables": [],
        "is_additive": False,
        "is_aggregation": False,
        "is_dimensional": False,
        "is_filterable": True,
        "is_increase_desired": True,
        "is_partition": False,
        "is_physical": True,
        "is_spatial": False,
        "is_temporal": False,
        "description": None,
        "extra_json": "{}",
        "unit": None,
        "warning_text": None,
        "is_managed_externally": False,
        "external_url": None,
    }


@pytest.fixture
def sample_columns() -> dict["TableColumn", dict[str, Any]]:
    from zobi.connectors.sqla.models import TableColumn

    return {
        TableColumn(column_name="ds", is_dttm=1, type="TIMESTAMP"): {
            "name": "ds",
            "expression": "ds",
            "type": "TIMESTAMP",
            "advanced_data_type": None,
            "is_temporal": True,
            "is_physical": True,
        },
        TableColumn(column_name="num_boys", type="INTEGER", groupby=True): {
            "name": "num_boys",
            "expression": "num_boys",
            "type": "INTEGER",
            "advanced_data_type": None,
            "is_dimensional": True,
            "is_physical": True,
        },
        TableColumn(column_name="region", type="VARCHAR", groupby=True): {
            "name": "region",
            "expression": "region",
            "type": "VARCHAR",
            "advanced_data_type": None,
            "is_dimensional": True,
            "is_physical": True,
        },
        TableColumn(
            column_name="profit",
            type="INTEGER",
            groupby=False,
            expression="revenue-expenses",
        ): {
            "name": "profit",
            "expression": "revenue-expenses",
            "type": "INTEGER",
            "advanced_data_type": None,
            "is_physical": False,
        },
    }


@pytest.fixture
def sample_metrics() -> dict["SqlMetric", dict[str, Any]]:
    from zobi.connectors.sqla.models import SqlMetric

    return {
        SqlMetric(metric_name="cnt", expression="COUNT(*)", metric_type="COUNT"): {
            "name": "cnt",
            "expression": "COUNT(*)",
            "extra_json": '{"metric_type": "COUNT"}',
            "type": "UNKNOWN",
            "advanced_data_type": None,
            "is_additive": True,
            "is_aggregation": True,
            "is_filterable": False,
            "is_physical": False,
        },
        SqlMetric(
            metric_name="avg revenue", expression="AVG(revenue)", metric_type="AVG"
        ): {
            "name": "avg revenue",
            "expression": "AVG(revenue)",
            "extra_json": '{"metric_type": "AVG"}',
            "type": "UNKNOWN",
            "advanced_data_type": None,
            "is_additive": False,
            "is_aggregation": True,
            "is_filterable": False,
            "is_physical": False,
        },
    }
