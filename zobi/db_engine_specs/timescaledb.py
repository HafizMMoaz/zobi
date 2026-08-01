
from __future__ import annotations

from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.postgres import PostgresBaseEngineSpec


class TimescaleDBEngineSpec(PostgresBaseEngineSpec):
    """
    Engine spec for TimescaleDB.

    TimescaleDB is an open-source time-series database built on PostgreSQL.
    """

    engine = "timescaledb"
    engine_name = "TimescaleDB"
    default_driver = "psycopg2"

    metadata = {
        "description": (
            "TimescaleDB is an open-source relational database for time-series "
            "and analytics, built on PostgreSQL."
        ),
        "logo": "timescale.png",
        "homepage_url": "https://www.timescale.com/",
        "categories": [
            DatabaseCategory.ANALYTICAL_DATABASES,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["psycopg2"],
        "connection_string": (
            "postgresql://{username}:{password}@{host}:{port}/{database}"
        ),
        "default_port": 5432,
        "connection_examples": [
            {
                "description": "Timescale Cloud (SSL required)",
                "connection_string": (
                    "postgresql://{username}:{password}@{host}:{port}/"
                    "{database}?sslmode=require"
                ),
            },
        ],
        "notes": "Uses the PostgreSQL driver. psycopg2 comes bundled with Zobi.",
        "docs_url": "https://docs.timescale.com/",
    }
