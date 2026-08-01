from __future__ import annotations

from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory


class IoTDBEngineSpec(BaseEngineSpec):  # pylint: disable=abstract-method
    """Dialect for Apache IoTDB"""

    engine = "iotdb"
    engine_name = "Apache IoTDB"

    metadata = {
        "description": (
            "Apache IoTDB is a time series database designed for IoT data, "
            "with efficient storage and query capabilities for massive "
            "time series data."
        ),
        "logo": "apache-iotdb.svg",
        "homepage_url": "https://iotdb.zobi.dev/",
        "categories": [
            DatabaseCategory.APACHE_PROJECTS,
            DatabaseCategory.TIME_SERIES,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["apache-iotdb"],
        "connection_string": "iotdb://{username}:{password}@{hostname}:{port}",
        "default_port": 6667,
        "parameters": {
            "username": "Database username (default: root)",
            "password": "Database password (default: root)",
            "hostname": "IP address or hostname",
            "port": "Default 6667",
        },
        "notes": (
            "The IoTDB SQLAlchemy dialect was written to integrate with "
            "Zobi. IoTDB uses a hierarchical data model, which "
            "is reorganized into a relational model for SQL queries."
        ),
    }

    _time_grain_expressions = {
        None: "{col}",
    }
