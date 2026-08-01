from datetime import datetime
from typing import Any, Optional

from sqlalchemy import types

from zobi.constants import TimeGrain
from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory
from zobi.sql.parse import LimitMethod


class FirebirdEngineSpec(BaseEngineSpec):
    """Engine for Firebird"""

    engine = "firebird"
    engine_name = "Firebird"

    metadata = {
        "description": "Firebird is an open-source relational database.",
        "logo": "firebird.png",
        "homepage_url": "https://firebirdsql.org/",
        "categories": [
            DatabaseCategory.TRADITIONAL_RDBMS,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["sqlalchemy-firebird"],
        "version_requirements": "sqlalchemy-firebird>=0.7.0,<0.8",
        "connection_string": "firebird+fdb://{username}:{password}@{host}:{port}//{path_to_db_file}",
        "default_port": 3050,
        "connection_examples": [
            {
                "description": "Local database",
                "connection_string": "firebird+fdb://SYSDBA:masterkey@192.168.86.38:3050//Library/Frameworks/Firebird.framework/Versions/A/Resources/examples/empbuild/employee.fdb",
            },
        ],
    }

    # Firebird uses FIRST to limit: `SELECT FIRST 10 * FROM table`
    limit_method = LimitMethod.FETCH_MANY

    _time_grain_expressions = {
        None: "{col}",
        TimeGrain.SECOND: (
            "CAST(CAST({col} AS DATE) "
            "|| ' ' "
            "|| EXTRACT(HOUR FROM {col}) "
            "|| ':' "
            "|| EXTRACT(MINUTE FROM {col}) "
            "|| ':' "
            "|| FLOOR(EXTRACT(SECOND FROM {col})) AS TIMESTAMP)"
        ),
        TimeGrain.MINUTE: (
            "CAST(CAST({col} AS DATE) "
            "|| ' ' "
            "|| EXTRACT(HOUR FROM {col}) "
            "|| ':' "
            "|| EXTRACT(MINUTE FROM {col}) "
            "|| ':00' AS TIMESTAMP)"
        ),
        TimeGrain.HOUR: (
            "CAST(CAST({col} AS DATE) "
            "|| ' ' "
            "|| EXTRACT(HOUR FROM {col}) "
            "|| ':00:00' AS TIMESTAMP)"
        ),
        TimeGrain.DAY: "CAST({col} AS DATE)",
        TimeGrain.MONTH: (
            "CAST(EXTRACT(YEAR FROM {col}) "
            "|| '-' "
            "|| EXTRACT(MONTH FROM {col}) "
            "|| '-01' AS DATE)"
        ),
        TimeGrain.YEAR: "CAST(EXTRACT(YEAR FROM {col}) || '-01-01' AS DATE)",
    }

    @classmethod
    def epoch_to_dttm(cls) -> str:
        return "DATEADD(second, {col}, CAST('00:00:00' AS TIMESTAMP))"

    @classmethod
    def convert_dttm(
        cls, target_type: str, dttm: datetime, db_extra: Optional[dict[str, Any]] = None
    ) -> Optional[str]:
        sqla_type = cls.get_sqla_column_type(target_type)

        if isinstance(sqla_type, types.Date):
            return f"CAST('{dttm.date().isoformat()}' AS DATE)"
        if isinstance(sqla_type, types.DateTime):
            dttm_formatted = dttm.isoformat(sep=" ")
            dttm_valid_precision = dttm_formatted[: len("YYYY-MM-DD HH:MM:SS.MMMM")]
            return f"CAST('{dttm_valid_precision}' AS TIMESTAMP)"
        if isinstance(sqla_type, types.Time):
            return f"CAST('{dttm.time().isoformat()}' AS TIME)"
        return None
