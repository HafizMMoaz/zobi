from datetime import datetime
from typing import Any, Optional

from sqlalchemy import types

from zobi.constants import TimeGrain
from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory


class DynamoDBEngineSpec(BaseEngineSpec):
    engine = "dynamodb"
    engine_name = "Amazon DynamoDB"

    metadata = {
        "description": (
            "Amazon DynamoDB is a serverless NoSQL database with SQL via PartiQL."
        ),
        "logo": "aws.png",
        "homepage_url": "https://aws.amazon.com/dynamodb/",
        "categories": [
            DatabaseCategory.CLOUD_AWS,
            DatabaseCategory.SEARCH_NOSQL,
            DatabaseCategory.PROPRIETARY,
        ],
        "pypi_packages": ["pydynamodb"],
        "connection_string": (
            "dynamodb://{aws_access_key_id}:{aws_secret_access_key}"
            "@dynamodb.{region}.amazonaws.com:443?connector=zobi"
        ),
        "parameters": {
            "aws_access_key_id": "AWS access key ID",
            "aws_secret_access_key": "AWS secret access key",
            "region": "AWS region (e.g., us-east-1)",
        },
        "notes": "Uses PartiQL for SQL queries. Requires connector=zobi parameter.",
        "docs_url": "https://github.com/passren/PyDynamoDB",
    }

    _time_grain_expressions = {
        None: "{col}",
        TimeGrain.SECOND: "DATETIME(STRFTIME('%Y-%m-%dT%H:%M:%S', {col}))",
        TimeGrain.MINUTE: "DATETIME(STRFTIME('%Y-%m-%dT%H:%M:00', {col}))",
        TimeGrain.HOUR: "DATETIME(STRFTIME('%Y-%m-%dT%H:00:00', {col}))",
        TimeGrain.DAY: "DATETIME({col}, 'start of day')",
        TimeGrain.WEEK: "DATETIME({col}, 'start of day', \
            -strftime('%w', {col}) || ' days')",
        TimeGrain.MONTH: "DATETIME({col}, 'start of month')",
        TimeGrain.QUARTER: (
            "DATETIME({col}, 'start of month', "
            "printf('-%d month', (strftime('%m', {col}) - 1) % 3))"
        ),
        TimeGrain.YEAR: "DATETIME({col}, 'start of year')",
        TimeGrain.WEEK_ENDING_SATURDAY: "DATETIME({col}, 'start of day', 'weekday 6')",
        TimeGrain.WEEK_ENDING_SUNDAY: "DATETIME({col}, 'start of day', 'weekday 0')",
        TimeGrain.WEEK_STARTING_SUNDAY: (
            "DATETIME({col}, 'start of day', 'weekday 0', '-7 days')"
        ),
        TimeGrain.WEEK_STARTING_MONDAY: (
            "DATETIME({col}, 'start of day', 'weekday 1', '-7 days')"
        ),
    }

    @classmethod
    def epoch_to_dttm(cls) -> str:
        return "datetime({col}, 'unixepoch')"

    @classmethod
    def convert_dttm(
        cls, target_type: str, dttm: datetime, db_extra: Optional[dict[str, Any]] = None
    ) -> Optional[str]:
        sqla_type = cls.get_sqla_column_type(target_type)

        if isinstance(sqla_type, (types.String, types.DateTime)):
            return f"""'{dttm.isoformat(sep=" ", timespec="seconds")}'"""

        return None
