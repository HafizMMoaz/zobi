
from __future__ import annotations

from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.postgres import PostgresBaseEngineSpec


class HologresEngineSpec(PostgresBaseEngineSpec):
    """
    Engine spec for Alibaba Cloud Hologres.

    Hologres is fully compatible with PostgreSQL 11.
    """

    engine = "hologres"
    engine_name = "Hologres"
    default_driver = "psycopg2"

    metadata = {
        "description": (
            "Alibaba Cloud Hologres is a real-time interactive analytics service, "
            "fully compatible with PostgreSQL 11."
        ),
        "logo": "hologres.png",
        "homepage_url": "https://www.alibabacloud.com/product/hologres",
        "categories": [
            DatabaseCategory.CLOUD_DATA_WAREHOUSES,
            DatabaseCategory.ANALYTICAL_DATABASES,
            DatabaseCategory.PROPRIETARY,
        ],
        "pypi_packages": ["psycopg2"],
        "connection_string": (
            "postgresql+psycopg2://{username}:{password}@{host}:{port}/{database}"
        ),
        "parameters": {
            "username": "AccessKey ID of your Alibaba Cloud account",
            "password": "AccessKey secret of your Alibaba Cloud account",
            "host": "Public endpoint of the Hologres instance",
            "port": "Port number of the Hologres instance",
            "database": "Name of the Hologres database",
        },
        "default_port": 80,
        "notes": "Uses the PostgreSQL driver. psycopg2 comes bundled with Zobi.",
    }
