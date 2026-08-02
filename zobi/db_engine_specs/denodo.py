import re
from datetime import datetime
from typing import Any, Optional

from sqlalchemy.types import Date, DateTime

from zobi.db_engine_specs.base import (
    BaseEngineSpec,
    BasicParametersMixin,
    DatabaseCategory,
)
from zobi.errors import ZobiErrorType


# Internal class for defining error message patterns (for translation)
class _ErrorPatterns:  # pylint: disable=too-few-public-methods
    CONN_INVALID_USER_PWD_REGEX = re.compile("The username or password is incorrect")
    CONN_INVALID_PWD_NEEDED_REGEX = re.compile("no password supplied")
    CONN_INVALID_HOSTNAME_REGEX = re.compile(
        'could not translate host name "(?P<hostname>.*?)" to address: '
    )
    CONN_PORT_CLOSED_REGEX = re.compile(
        "Is the server running on that host and accepting"
    )
    CONN_UNKNOWN_DATABASE_REGEX = re.compile("Database '(?P<database>.*?)' not found")
    CONN_FORBIDDEN_DATABASE_REGEX = re.compile(
        "Insufficient privileges to connect to the database '(?P<database>.*?)'"
    )
    QUERY_SYNTAX_ERROR_REGEX = re.compile("Exception parsing query near '(?P<err>.*?)'")
    QUERY_COLUMN_NOT_EXIST_REGEX = re.compile(
        "Field not found '(?P<column>.*?)' in view '(?P<view>.*?)'"
    )
    QUERY_GROUPBY_ERROR_REGEX = re.compile(
        "Error computing capabilities of GROUP BY view"
    )
    QUERY_GROUPBY_CANT_PROJ_REGEX = re.compile(
        "Invalid GROUP BY expression. '(?P<exp>.*?)' cannot be projected"
    )


class DenodoEngineSpec(BaseEngineSpec, BasicParametersMixin):
    engine = "denodo"
    engine_name = "Denodo"

    default_driver = "psycopg2"
    sqlalchemy_uri_placeholder = (
        "denodo://user:password@host:port/dbname[?key=value&key=value...]"
    )
    encryption_parameters = {"sslmode": "require"}

    metadata = {
        "description": (
            "Denodo is a data virtualization platform for logical data management."
        ),
        "logo": "denodo.png",
        "homepage_url": "https://www.denodo.com/",
        "categories": [DatabaseCategory.QUERY_ENGINES, DatabaseCategory.PROPRIETARY],
        "pypi_packages": ["psycopg2"],
        "connection_string": "denodo://{username}:{password}@{host}:{port}/{database}",
        "default_port": 9996,
        "parameters": {
            "username": "Denodo username",
            "password": "Denodo password",
            "host": "Denodo VDP server hostname",
            "port": "ODBC port (default 9996)",
            "database": "Virtual database name",
        },
        "drivers": [
            {
                "name": "psycopg2",
                "pypi_package": "psycopg2",
                "connection_string": (
                    "denodo://{username}:{password}@{host}:{port}/{database}"
                ),
                "is_recommended": True,
                "notes": "Uses PostgreSQL wire protocol.",
            },
        ],
    }

    _time_grain_expressions = {
        None: "{col}",
        "PT1M": "TRUNC({col},'MI')",
        "PT1H": "TRUNC({col},'HH')",
        "P1D": "TRUNC({col},'DDD')",
        "P1W": "TRUNC({col},'W')",
        "P1M": "TRUNC({col},'MONTH')",
        "P3M": "TRUNC({col},'Q')",
        "P1Y": "TRUNC({col},'YEAR')",
    }

    custom_errors: dict[re.Pattern[str], tuple[str, ZobiErrorType, dict[str, Any]]] = {
        _ErrorPatterns.CONN_INVALID_USER_PWD_REGEX: (
            "Incorrect username or password.",
            ZobiErrorType.CONNECTION_INVALID_USERNAME_ERROR,
            {"invalid": ["username", "password"]},
        ),
        _ErrorPatterns.CONN_INVALID_PWD_NEEDED_REGEX: (
            "Please enter a password.",
            ZobiErrorType.CONNECTION_ACCESS_DENIED_ERROR,
            {"invalid": ["password"]},
        ),
        _ErrorPatterns.CONN_INVALID_HOSTNAME_REGEX: (
            'Hostname "%(hostname)s" cannot be resolved.',
            ZobiErrorType.CONNECTION_INVALID_HOSTNAME_ERROR,
            {"invalid": ["host"]},
        ),
        _ErrorPatterns.CONN_PORT_CLOSED_REGEX: (
            "Server refused the connection: check hostname and port.",
            ZobiErrorType.CONNECTION_PORT_CLOSED_ERROR,
            {"invalid": ["host", "port"]},
        ),
        _ErrorPatterns.CONN_UNKNOWN_DATABASE_REGEX: (
            'Unable to connect to database "%(database)s"',
            ZobiErrorType.CONNECTION_UNKNOWN_DATABASE_ERROR,
            {"invalid": ["database"]},
        ),
        _ErrorPatterns.CONN_FORBIDDEN_DATABASE_REGEX: (
            'Unable to connect to database "%(database)s": database does not '
            "exist or insufficient permissions",
            ZobiErrorType.CONNECTION_DATABASE_PERMISSIONS_ERROR,
            {"invalid": ["database"]},
        ),
        _ErrorPatterns.QUERY_SYNTAX_ERROR_REGEX: (
            "Please check your query for syntax errors at or "
            'near "%(err)s". Then, try running your query again.',
            ZobiErrorType.SYNTAX_ERROR,
            {},
        ),
        _ErrorPatterns.QUERY_COLUMN_NOT_EXIST_REGEX: (
            'Column "%(column)s" not found in "%(view)s".',
            ZobiErrorType.COLUMN_DOES_NOT_EXIST_ERROR,
            {},
        ),
        _ErrorPatterns.QUERY_GROUPBY_ERROR_REGEX: (
            "Invalid aggregation expression.",
            ZobiErrorType.SYNTAX_ERROR,
            {},
        ),
        _ErrorPatterns.QUERY_GROUPBY_CANT_PROJ_REGEX: (
            '"%(exp)s" is neither an aggregation function nor '
            "appears in the GROUP BY clause.",
            ZobiErrorType.SYNTAX_ERROR,
            {},
        ),
    }

    @classmethod
    def epoch_to_dttm(cls) -> str:
        return "GETTIMEFROMMILLIS({col})"

    @classmethod
    def convert_dttm(
        cls, target_type: str, dttm: datetime, db_extra: Optional[dict[str, Any]] = None
    ) -> Optional[str]:
        sqla_type = cls.get_sqla_column_type(target_type)
        if isinstance(sqla_type, Date):
            return f"TO_DATE('yyyy-MM-dd', '{dttm.date().isoformat()}')"
        if isinstance(sqla_type, DateTime):
            dttm_formatted = dttm.isoformat(sep=" ", timespec="milliseconds")
            return f"TO_TIMESTAMP('yyyy-MM-dd HH:mm:ss.SSS', '{dttm_formatted}')"
        return None

    @classmethod
    def get_datatype(cls, type_code: Any) -> Optional[str]:
        # pylint: disable=import-outside-toplevel
        from psycopg2.extensions import binary_types, string_types

        # Obtain data type names from psycopg2
        types = binary_types.copy()
        types.update(string_types)
        if type_code in types:
            return types[type_code].name
        return None
