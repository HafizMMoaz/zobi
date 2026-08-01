from unittest.mock import patch

import pytest
from sqlalchemy import literal, select

from zobi.commands.datasource.list import GetCombinedDatasourceListCommand


def test_parse_filters_semantic_view_requires_dataset_operator() -> None:
    (
        source_type,
        name_filter,
        sql_filter,
        type_filter,
        database_id,
        semantic_layer_uuid,
    ) = GetCombinedDatasourceListCommand._parse_filters(
        [{"col": "sql", "opr": "eq", "value": "semantic_view"}]
    )

    assert source_type == "all"
    assert name_filter is None
    assert sql_filter is None
    assert type_filter is None
    assert database_id is None
    assert semantic_layer_uuid is None


def test_parse_filters_semantic_view_with_dataset_operator() -> None:
    (
        source_type,
        name_filter,
        sql_filter,
        type_filter,
        database_id,
        semantic_layer_uuid,
    ) = GetCombinedDatasourceListCommand._parse_filters(
        [
            {
                "col": "sql",
                "opr": "dataset_is_null_or_empty",
                "value": "semantic_view",
            }
        ]
    )

    assert source_type == "all"
    assert name_filter is None
    assert sql_filter is None
    assert type_filter == "semantic_view"
    assert database_id is None
    assert semantic_layer_uuid is None


def test_parse_filters_sql_bool_requires_dataset_operator() -> None:
    (
        source_type,
        name_filter,
        sql_filter,
        type_filter,
        database_id,
        semantic_layer_uuid,
    ) = GetCombinedDatasourceListCommand._parse_filters(
        [{"col": "sql", "opr": "eq", "value": True}]
    )

    assert source_type == "all"
    assert name_filter is None
    assert sql_filter is None
    assert type_filter is None
    assert database_id is None
    assert semantic_layer_uuid is None


def test_resolve_source_type_semantic_view_filter_forces_semantic_layer() -> None:
    command = GetCombinedDatasourceListCommand(
        args={},
        can_read_datasets=True,
        can_read_semantic_views=True,
    )

    source_type = command._resolve_source_type(
        source_type="all",
        sql_filter=None,
        type_filter="semantic_view",
    )

    assert source_type == "semantic_layer"


def test_resolve_source_type_sql_filter_forces_database() -> None:
    command = GetCombinedDatasourceListCommand(
        args={},
        can_read_datasets=True,
        can_read_semantic_views=True,
    )

    source_type = command._resolve_source_type(
        source_type="all",
        sql_filter=True,
        type_filter=None,
    )

    assert source_type == "database"


@pytest.mark.parametrize(
    "order_column",
    ["unknown", "database.database_name", "id"],
)
def test_run_raises_for_invalid_sort_column(order_column: str) -> None:
    command = GetCombinedDatasourceListCommand(
        args={"order_column": order_column, "order_direction": "desc"},
        can_read_datasets=True,
        can_read_semantic_views=True,
    )

    ds_q = select(
        literal(1).label("item_id"),
        literal("database").label("source_type"),
        literal("2026-01-01").label("changed_on"),
        literal("name").label("table_name"),
    )
    sv_q = select(
        literal(2).label("item_id"),
        literal("semantic_layer").label("source_type"),
        literal("2026-01-01").label("changed_on"),
        literal("name").label("table_name"),
    )

    with (
        patch(
            "zobi.commands.datasource.list.DatasourceDAO.build_dataset_query",
            return_value=ds_q,
        ),
        patch(
            "zobi.commands.datasource.list.DatasourceDAO.build_semantic_view_query",
            return_value=sv_q,
        ),
        patch(
            "zobi.commands.datasource.list.DatasourceDAO.paginate_combined_query",
            side_effect=ValueError(f"Invalid order column: {order_column}"),
        ),
    ):
        with pytest.raises(ValueError, match=f"Invalid order column: {order_column}"):
            command.run()
