from datetime import datetime
from typing import Any, Optional

from sqlalchemy import types

from zobi.constants import TimeGrain
from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.postgres import PostgresBaseEngineSpec
from zobi.sql.parse import LimitMethod


class HanaEngineSpec(PostgresBaseEngineSpec):
    engine = "hana"
    engine_name = "SAP HANA"

    metadata = {
        "description": (
            "SAP HANA is an in-memory relational database and application platform."
        ),
        "logo": "sap-hana.png",
        "homepage_url": "https://www.sap.com/products/technology-platform/hana.html",
        "categories": [
            DatabaseCategory.TRADITIONAL_RDBMS,
            DatabaseCategory.PROPRIETARY,
        ],
        "pypi_packages": ["hdbcli", "sqlalchemy-hana"],
        "install_instructions": "pip install zobi[hana]",
        "connection_string": "hana://{username}:{password}@{host}:{port}",
        "default_port": 30015,
        "docs_url": "https://github.com/SAP/sqlalchemy-hana",
    }
    limit_method = LimitMethod.WRAP_SQL
    force_column_alias_quotes = True
    max_column_name_length = 30

    _time_grain_expressions = {
        None: "{col}",
        TimeGrain.SECOND: "TO_TIMESTAMP(SUBSTRING(TO_TIMESTAMP({col}),0,20))",
        TimeGrain.MINUTE: "TO_TIMESTAMP(SUBSTRING(TO_TIMESTAMP({col}),0,17) || '00')",
        TimeGrain.HOUR: "TO_TIMESTAMP(SUBSTRING(TO_TIMESTAMP({col}),0,14) || '00:00')",
        TimeGrain.DAY: "TO_DATE({col})",
        TimeGrain.MONTH: "TO_DATE(SUBSTRING(TO_DATE({col}),0,7)||'-01')",
        TimeGrain.QUARTER: "TO_DATE(SUBSTRING( \
                   TO_DATE({col}), 0, 5)|| LPAD(CAST((CAST(SUBSTRING(QUARTER( \
                   TO_DATE({col}), 1), 7, 1) as int)-1)*3 +1 as text),2,'0') ||'-01')",
        TimeGrain.YEAR: "TO_DATE(YEAR({col})||'-01-01')",
    }

    @classmethod
    def convert_dttm(
        cls, target_type: str, dttm: datetime, db_extra: Optional[dict[str, Any]] = None
    ) -> Optional[str]:
        sqla_type = cls.get_sqla_column_type(target_type)

        if isinstance(sqla_type, types.Date):
            return f"TO_DATE('{dttm.date().isoformat()}', 'YYYY-MM-DD')"
        if isinstance(sqla_type, types.TIMESTAMP):
            return f"""TO_TIMESTAMP('{
                dttm.isoformat(timespec="microseconds")
            }', 'YYYY-MM-DD"T"HH24:MI:SS.ff6')"""
        return None
