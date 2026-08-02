from __future__ import annotations

from zobi.constants import TimeGrain
from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory


class ArcEngineSpec(BaseEngineSpec):
    """Engine spec for Arc data platform."""

    engine = "arc"
    engine_name = "Arc"
    default_driver = "arrow"

    _time_grain_expressions = {
        None: "{col}",
        TimeGrain.SECOND: "DATE_TRUNC('second', {col})",
        TimeGrain.MINUTE: "DATE_TRUNC('minute', {col})",
        TimeGrain.HOUR: "DATE_TRUNC('hour', {col})",
        TimeGrain.DAY: "DATE_TRUNC('day', {col})",
        TimeGrain.WEEK: "DATE_TRUNC('week', {col})",
        TimeGrain.MONTH: "DATE_TRUNC('month', {col})",
        TimeGrain.QUARTER: "DATE_TRUNC('quarter', {col})",
        TimeGrain.YEAR: "DATE_TRUNC('year', {col})",
    }

    metadata = {
        "description": "Arc is a data platform with multiple connection options.",
        "categories": [DatabaseCategory.OTHER, DatabaseCategory.PROPRIETARY],
        "pypi_packages": ["arc-zobi-arrow"],
        "connection_string": ("arc+arrow://{api_key}@{hostname}:{port}/{database}"),
        "parameters": {
            "api_key": "Arc API key",
            "hostname": "Arc hostname",
            "port": "Arc port",
            "database": "Database name",
        },
        "drivers": [
            {
                "name": "Apache Arrow (Recommended)",
                "pypi_package": "arc-zobi-arrow",
                "connection_string": (
                    "arc+arrow://{api_key}@{hostname}:{port}/{database}"
                ),
                "is_recommended": True,
                "notes": (
                    "Recommended for production. "
                    "Provides 3-5x better performance using Apache Arrow IPC."
                ),
            },
            {
                "name": "JSON",
                "pypi_package": "arc-zobi-dialect",
                "connection_string": (
                    "arc+json://{api_key}@{hostname}:{port}/{database}"
                ),
                "is_recommended": False,
            },
        ],
        "notes": (
            "Arc supports multiple databases (schemas) within a single instance. "
            "Each Arc database appears as a schema in SQL Lab."
        ),
    }
