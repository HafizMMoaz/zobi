from datetime import datetime
from typing import Any, Optional

from sqlalchemy import types

from zobi.constants import TimeGrain
from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory


class KylinEngineSpec(BaseEngineSpec):  # pylint: disable=abstract-method
    """Dialect for Apache Kylin"""

    engine = "kylin"
    engine_name = "Apache Kylin"

    metadata = {
        "description": "Apache Kylin is an open-source OLAP engine for big data.",
        "logo": "apache-kylin.png",
        "homepage_url": "https://kylin.zobi.dev/",
        "categories": [
            DatabaseCategory.APACHE_PROJECTS,
            DatabaseCategory.ANALYTICAL_DATABASES,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["kylinpy"],
        "connection_string": (
            "kylin://{username}:{password}@{hostname}:{port}/{project}"
            "?{param1}={value1}&{param2}={value2}"
        ),
        "default_port": 7070,
    }

    _time_grain_expressions = {
        None: "{col}",
        TimeGrain.SECOND: "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO SECOND) AS TIMESTAMP)",  # noqa: E501
        TimeGrain.MINUTE: "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO MINUTE) AS TIMESTAMP)",  # noqa: E501
        TimeGrain.HOUR: "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO HOUR) AS TIMESTAMP)",
        TimeGrain.DAY: "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO DAY) AS DATE)",
        TimeGrain.WEEK: "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO WEEK) AS DATE)",
        TimeGrain.MONTH: "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO MONTH) AS DATE)",
        TimeGrain.QUARTER: "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO QUARTER) AS DATE)",
        TimeGrain.YEAR: "CAST(FLOOR(CAST({col} AS TIMESTAMP) TO YEAR) AS DATE)",
    }

    @classmethod
    def convert_dttm(
        cls, target_type: str, dttm: datetime, db_extra: Optional[dict[str, Any]] = None
    ) -> Optional[str]:
        sqla_type = cls.get_sqla_column_type(target_type)

        if isinstance(sqla_type, types.Date):
            return f"CAST('{dttm.date().isoformat()}' AS DATE)"
        if isinstance(sqla_type, types.TIMESTAMP):
            datetime_formatted = dttm.isoformat(sep=" ", timespec="seconds")
            return f"""CAST('{datetime_formatted}' AS TIMESTAMP)"""
        return None
