from datetime import datetime
from typing import Any, Optional

from sqlalchemy import types

from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.postgres import PostgresEngineSpec


class CockroachDbEngineSpec(PostgresEngineSpec):
    engine = "cockroachdb"
    engine_name = "CockroachDB"

    metadata = {
        "description": (
            "CockroachDB is a distributed SQL database built for cloud applications."
        ),
        "logo": "cockroachdb.png",
        "homepage_url": "https://www.cockroachlabs.com/",
        "categories": [
            DatabaseCategory.TRADITIONAL_RDBMS,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["cockroachdb"],
        "connection_string": "cockroachdb://root@{hostname}:{port}/{database}?sslmode=disable",
        "default_port": 26257,
        "docs_url": "https://github.com/cockroachdb/sqlalchemy-cockroachdb",
    }

    @classmethod
    def convert_dttm(
        cls, target_type: str, dttm: datetime, db_extra: Optional[dict[str, Any]] = None
    ) -> Optional[str]:
        sqla_type = cls.get_sqla_column_type(target_type)
        if isinstance(sqla_type, types.Date):
            return f"'{dttm.date().isoformat()}'"
        if isinstance(sqla_type, (types.String, types.DateTime)):
            return f"""'{dttm.isoformat(sep=" ", timespec="seconds")}'"""
        return None
