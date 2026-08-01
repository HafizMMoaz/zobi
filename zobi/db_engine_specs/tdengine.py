from __future__ import annotations

from typing import Any
from urllib import parse

from sqlalchemy.engine.url import make_url, URL  # noqa: F401

from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory


class TDengineEngineSpec(BaseEngineSpec):
    engine = "taosws"
    engine_name = "TDengine"
    max_column_name_length = 64
    default_driver = "taosws"
    sqlalchemy_uri_placeholder = (
        "taosws://user:******@host:port/dbname[?key=value&key=value...]"
    )

    metadata = {
        "description": "TDengine is a high-performance time-series database for IoT.",
        "logo": "tdengine.png",
        "homepage_url": "https://tdengine.com/",
        "categories": [DatabaseCategory.TIME_SERIES, DatabaseCategory.OPEN_SOURCE],
        "pypi_packages": ["taospy", "taos-ws-py"],
        "connection_string": "taosws://{user}:{password}@{host}:{port}",
        "default_port": 6041,
        "connection_examples": [
            {
                "description": "Local connection",
                "connection_string": "taosws://root:taosdata@127.0.0.1:6041",
            },
        ],
        "docs_url": "https://www.tdengine.com",
    }

    # time grain
    _time_grain_expressions = {
        None: "{col}",
        "PT1S": "TIMETRUNCATE({col}, 1s, 0)",
        "PT1M": "TIMETRUNCATE({col}, 1m, 0)",
        "PT1H": "TIMETRUNCATE({col}, 1h, 0)",
        "P1D": "TIMETRUNCATE({col}, 1d, 0)",
        "P1W": "TIMETRUNCATE({col}, 1w, 0)",
    }

    @classmethod
    def get_schema_from_engine_params(
        cls,
        sqlalchemy_uri: URL,
        connect_args: dict[str, Any],
    ) -> str | None:
        """
        Return the configured schema.

        A TDengine database is a SQLAlchemy schema.
        """
        return parse.unquote(sqlalchemy_uri.database)
