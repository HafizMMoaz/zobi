from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.postgres import PostgresEngineSpec


class RisingWaveDbEngineSpec(PostgresEngineSpec):
    engine = "risingwave"
    engine_name = "RisingWave"
    default_driver = ""
    sqlalchemy_uri_placeholder = (
        "risingwave://user:password@host:port/dbname[?key=value&key=value...]"
    )

    metadata = {
        "description": "RisingWave is a distributed streaming database.",
        "logo": "risingwave.svg",
        "homepage_url": "https://risingwave.com/",
        "categories": [
            DatabaseCategory.ANALYTICAL_DATABASES,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["sqlalchemy-risingwave"],
        "connection_string": (
            "risingwave://root@{hostname}:{port}/{database}?sslmode=disable"
        ),
        "default_port": 4566,
        "docs_url": "https://github.com/risingwavelabs/sqlalchemy-risingwave",
    }
