from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.postgres import PostgresBaseEngineSpec


class VerticaEngineSpec(PostgresBaseEngineSpec):
    engine = "vertica"
    engine_name = "Vertica"

    metadata = {
        "description": "Vertica is a column-oriented analytics database.",
        "logo": "vertica.png",
        "homepage_url": "https://www.vertica.com/",
        "categories": [
            DatabaseCategory.ANALYTICAL_DATABASES,
            DatabaseCategory.PROPRIETARY,
        ],
        "pypi_packages": ["sqlalchemy-vertica-python"],
        "connection_string": "vertica+vertica_python://{username}:{password}@{host}/{database}",
        "default_port": 5433,
        "parameters": {
            "username": "Database username",
            "password": "Database password",
            "host": "localhost, IP address, or hostname (cloud or on-prem)",
            "database": "Database name",
            "port": "Default 5433",
        },
        "notes": "Supports load balancer backup host configuration.",
        "docs_url": "http://www.vertica.com/",
    }
