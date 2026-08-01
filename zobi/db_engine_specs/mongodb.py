"""MongoDB engine spec for Zobi.

Uses PyMongoSQL (https://github.com/passren/PyMongoSQL) as the SQLAlchemy dialect
to enable SQL queries on MongoDB collections.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from sqlalchemy import types

from zobi.constants import TimeGrain
from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory


class MongoDBEngineSpec(BaseEngineSpec):
    """Engine spec for MongoDB using PyMongoSQL dialect."""

    engine = "mongodb"
    engine_name = "MongoDB"
    force_column_alias_quotes = False

    metadata = {
        "description": ("MongoDB is a document-oriented, operational NoSQL database."),
        "logo": "mongodb.png",
        "homepage_url": "https://www.mongodb.com/",
        "categories": [
            DatabaseCategory.SEARCH_NOSQL,
            DatabaseCategory.PROPRIETARY,
        ],
        "pypi_packages": ["pymongosql"],
        "connection_string": (
            "mongodb://{username}:{password}@{host}:{port}/{database}?mode=zobi"
        ),
        "parameters": {
            "username": "Username for MongoDB",
            "password": "Password for MongoDB",
            "host": "MongoDB host",
            "port": "MongoDB port",
            "database": "Database name",
        },
        "drivers": [
            {
                "name": "MongoDB Atlas Cloud",
                "pypi_package": "pymongosql",
                "connection_string": "mongodb+srv://{username}:{password}@{host}/{database}?mode=zobi",
                "notes": "For MongoDB Atlas cloud service.",
                "is_recommended": True,
            },
            {
                "name": "MongoDB Cluster",
                "pypi_package": "pymongosql",
                "connection_string": "mongodb://{username}:{password}@{host}:{port}/{database}?mode=zobi",
                "is_recommended": False,
                "notes": ("For self-hosted MongoDB instances."),
            },
        ],
        "notes": "Uses PartiQL for SQL queries. Requires mode=zobi parameter.",
        "docs_url": "https://github.com/passren/PyMongoSQL",
    }

    _time_grain_expressions = {
        None: "{col}",
        TimeGrain.SECOND: "DATETIME(STRFTIME('%Y-%m-%dT%H:%M:%S', {col}))",
        TimeGrain.MINUTE: "DATETIME(STRFTIME('%Y-%m-%dT%H:%M:00', {col}))",
        TimeGrain.HOUR: "DATETIME(STRFTIME('%Y-%m-%dT%H:00:00', {col}))",
        TimeGrain.DAY: "DATETIME({col}, 'start of day')",
        TimeGrain.WEEK: (
            "DATETIME({col}, 'start of day', -strftime('%w', {col}) || ' days')"
        ),
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
        cls,
        target_type: str,
        dttm: datetime,
        db_extra: Optional[dict[str, Any]] = None,
    ) -> Optional[str]:
        """Convert Python datetime to MongoDB/SQL datetime string."""
        sqla_type = cls.get_sqla_column_type(target_type)

        if isinstance(
            sqla_type, (types.String, types.DateTime, types.Date, types.TIMESTAMP)
        ):
            # Return ISO format datetime string for MongoDB compatibility
            return f"""{dttm.isoformat(sep=" ", timespec="seconds")!r}"""

        return None
