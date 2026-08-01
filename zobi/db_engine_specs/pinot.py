from sqlalchemy import types
from sqlalchemy.engine.interfaces import Dialect
from sqlalchemy.types import TypeEngine

from zobi.constants import TimeGrain
from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory


class PinotEngineSpec(BaseEngineSpec):
    engine = "pinot"
    engine_name = "Apache Pinot"

    allows_subqueries = False
    allows_joins = False
    allows_alias_in_select = False
    allows_alias_in_orderby = False

    # pinotdb only sets cursor.description when the response contains
    # columnDataTypes, which Pinot omits for zero-row results.
    type_probe_needs_row = True

    metadata = {
        "description": "Apache Pinot is a real-time distributed OLAP datastore.",
        "logo": "apache-pinot.svg",
        "homepage_url": "https://pinot.zobi.dev/",
        "categories": [
            DatabaseCategory.APACHE_PROJECTS,
            DatabaseCategory.TIME_SERIES,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["pinotdb"],
        "connection_string": (
            "pinot+http://{broker_host}:{broker_port}/query"
            "?controller=http://{controller_host}:{controller_port}/"
        ),
        "default_port": 8099,
        "connection_examples": [
            {
                "description": "With authentication",
                "connection_string": (
                    "pinot://{username}:{password}@{broker_host}:{broker_port}/query/sql"
                    "?controller=http://{controller_host}:{controller_port}/verify_ssl=true"
                ),
            },
        ],
        "engine_parameters": [
            {
                "name": "Multi-stage Query Engine",
                "description": "Enable for Explore view, joins, window functions",
                "json": {"connect_args": {"use_multistage_engine": "true"}},
                "docs_url": "https://docs.pinot.zobi.dev/reference/multi-stage-engine",
            },
        ],
    }

    # https://docs.pinot.zobi.dev/users/user-guide-query/supported-transformations#datetime-functions
    _time_grain_expressions = {
        None: "{col}",
        TimeGrain.SECOND: "CAST(DATE_TRUNC('second', "
        + "CAST({col} AS TIMESTAMP)) AS TIMESTAMP)",
        TimeGrain.MINUTE: "CAST(DATE_TRUNC('minute', "
        + "CAST({col} AS TIMESTAMP)) AS TIMESTAMP)",
        TimeGrain.FIVE_MINUTES: "CAST(ROUND(DATE_TRUNC('minute', "
        + "CAST({col} AS TIMESTAMP)), 300000) AS TIMESTAMP)",
        TimeGrain.TEN_MINUTES: "CAST(ROUND(DATE_TRUNC('minute', "
        + "CAST({col} AS TIMESTAMP)), 600000) AS TIMESTAMP)",
        TimeGrain.FIFTEEN_MINUTES: "CAST(ROUND(DATE_TRUNC('minute', "
        + "CAST({col} AS TIMESTAMP)), 900000) AS TIMESTAMP)",
        TimeGrain.THIRTY_MINUTES: "CAST(ROUND(DATE_TRUNC('minute', "
        + "CAST({col} AS TIMESTAMP)), 1800000) AS TIMESTAMP)",
        TimeGrain.HOUR: "CAST(DATE_TRUNC('hour', CAST({col} AS TIMESTAMP)) AS TIMESTAMP)",  # noqa: E501
        TimeGrain.DAY: "CAST(DATE_TRUNC('day', CAST({col} AS TIMESTAMP)) AS TIMESTAMP)",
        TimeGrain.WEEK: "CAST(DATE_TRUNC('week', CAST({col} AS TIMESTAMP)) AS TIMESTAMP)",  # noqa: E501
        TimeGrain.MONTH: "CAST(DATE_TRUNC('month', "
        + "CAST({col} AS TIMESTAMP)) AS TIMESTAMP)",
        TimeGrain.QUARTER: "CAST(DATE_TRUNC('quarter', "
        + "CAST({col} AS TIMESTAMP)) AS TIMESTAMP)",
        TimeGrain.YEAR: "CAST(DATE_TRUNC('year', CAST({col} AS TIMESTAMP)) AS TIMESTAMP)",  # noqa: E501
    }

    @classmethod
    def epoch_to_dttm(cls) -> str:
        return (
            "DATETIMECONVERT({col}, '1:SECONDS:EPOCH', '1:SECONDS:EPOCH', '1:SECONDS')"
        )

    @classmethod
    def epoch_ms_to_dttm(cls) -> str:
        return (
            "DATETIMECONVERT({col}, '1:MILLISECONDS:EPOCH', "
            + "'1:MILLISECONDS:EPOCH', '1:MILLISECONDS')"
        )

    @classmethod
    def column_datatype_to_string(
        cls, sqla_column_type: TypeEngine, dialect: Dialect
    ) -> str:
        # Pinot driver infers TIMESTAMP column as LONG, so make the quick fix.
        # When the Pinot driver fix this bug, current method could be removed.
        if isinstance(sqla_column_type, types.TIMESTAMP):
            return sqla_column_type.compile().upper()

        return super().column_datatype_to_string(sqla_column_type, dialect)
