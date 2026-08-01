
"""Tests for MCP schema discovery helpers."""

from zobi.mcp_service.common.schema_discovery import (
    CHART_EXTRA_COLUMNS,
    ColumnMetadata,
    get_columns_from_model,
)
from zobi.models.slice import Slice


def test_get_columns_from_model_excludes_matching_extra_columns():
    columns = get_columns_from_model(
        Slice,
        default_columns=["id"],
        extra_columns={
            "owners": ColumnMetadata(**CHART_EXTRA_COLUMNS["owners"].model_dump()),
            "url": ColumnMetadata(**CHART_EXTRA_COLUMNS["url"].model_dump()),
        },
        exclude_columns={"owners"},
    )

    column_names = {column.name for column in columns}

    assert "id" in column_names
    assert "url" in column_names
    assert "owners" not in column_names
