from __future__ import annotations

from datetime import datetime
from typing import Any, TYPE_CHECKING

from sqlalchemy import types

from zobi.constants import TimeGrain
from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory

if TYPE_CHECKING:
    from zobi.connectors.sqla.models import TableColumn


class CrateEngineSpec(BaseEngineSpec):
    engine = "crate"
    engine_name = "CrateDB"

    metadata = {
        "description": (
            "CrateDB is a distributed SQL database for machine data and IoT workloads."
        ),
        "logo": "cratedb.svg",
        "homepage_url": "https://cratedb.com",
        "categories": [DatabaseCategory.TIME_SERIES, DatabaseCategory.OPEN_SOURCE],
        "pypi_packages": ["crate", "sqlalchemy-cratedb"],
        "connection_string": "crate://{host}:{port}",
        "default_port": 4200,
        "parameters": {
            "host": "CrateDB host",
            "port": "CrateDB HTTP port (default 4200)",
        },
        "drivers": [
            {
                "name": "crate",
                "pypi_package": "crate[sqlalchemy]",
                "connection_string": "crate://{host}:{port}",
                "is_recommended": True,
            },
        ],
    }

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

    @classmethod
    def epoch_to_dttm(cls) -> str:
        return "{col} * 1000"

    @classmethod
    def epoch_ms_to_dttm(cls) -> str:
        return "{col}"

    @classmethod
    def convert_dttm(
        cls, target_type: str, dttm: datetime, db_extra: dict[str, Any] | None = None
    ) -> str | None:
        sqla_type = cls.get_sqla_column_type(target_type)

        if isinstance(sqla_type, types.TIMESTAMP):
            return f"CAST('{dttm.isoformat()}' AS TIMESTAMP)"
        return None

    @classmethod
    def alter_new_orm_column(cls, orm_col: TableColumn) -> None:
        if orm_col.type == "TIMESTAMP":
            orm_col.python_date_format = "epoch_ms"
