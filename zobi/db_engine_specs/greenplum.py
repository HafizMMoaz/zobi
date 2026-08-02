from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.postgres import PostgresEngineSpec


class GreenplumEngineSpec(PostgresEngineSpec):
    """Engine spec for VMware Greenplum (formerly Pivotal Greenplum)

    Greenplum is a massively parallel processing (MPP) database built on PostgreSQL.
    It inherits PostgreSQL's SQL syntax and most features.
    """

    engine = "greenplum"
    engine_name = "Greenplum"
    default_driver = "psycopg2"

    metadata = {
        "description": (
            "VMware Greenplum is a massively parallel processing (MPP) "
            "database built on PostgreSQL."
        ),
        "logo": "greenplum.png",
        "homepage_url": "https://greenplum.org/",
        "categories": [
            DatabaseCategory.TRADITIONAL_RDBMS,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["sqlalchemy-greenplum", "psycopg2"],
        "connection_string": "greenplum://{username}:{password}@{host}:{port}/{database}",
        "default_port": 5432,
        "parameters": {
            "username": "Database username",
            "password": "Database password",
            "host": "Greenplum coordinator host",
            "port": "Default 5432",
            "database": "Database name",
        },
        "docs_url": "https://docs.vmware.com/en/VMware-Greenplum/",
    }
