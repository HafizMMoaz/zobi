
from __future__ import annotations

from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.postgres import PostgresBaseEngineSpec


class YugabyteDBEngineSpec(PostgresBaseEngineSpec):
    """
    Engine spec for YugabyteDB.

    YugabyteDB is a distributed SQL database built on top of PostgreSQL.
    """

    engine = "yugabytedb"
    engine_name = "YugabyteDB"
    default_driver = "psycopg2"

    metadata = {
        "description": (
            "YugabyteDB is a distributed SQL database built on top of PostgreSQL."
        ),
        "logo": "yugabyte.png",
        "homepage_url": "https://www.yugabyte.com/",
        "categories": [
            DatabaseCategory.CLOUD_DATA_WAREHOUSES,
            DatabaseCategory.TRADITIONAL_RDBMS,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["psycopg2"],
        "connection_string": (
            "postgresql://{username}:{password}@{host}:{port}/{database}"
        ),
        "default_port": 5433,
        "notes": "Uses the PostgreSQL driver. psycopg2 comes bundled with Zobi.",
        "docs_url": "https://docs.yugabyte.com/",
    }
