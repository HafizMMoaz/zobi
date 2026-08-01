import logging
import re
from re import Pattern
from typing import Any, Optional

from flask_babel import gettext as __
from sqlalchemy import Numeric, TEXT, types
from sqlalchemy.sql.type_api import TypeEngine

from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.mysql import MySQLEngineSpec
from zobi.errors import ZobiErrorType
from zobi.utils.core import GenericDataType

# Regular expressions to catch custom errors
CONNECTION_ACCESS_DENIED_REGEX = re.compile(
    "Access denied for user '(?P<username>.*?)'"
)
CONNECTION_INVALID_HOSTNAME_REGEX = re.compile(
    "Unknown OceanBase server host '(?P<hostname>.*?)'"
)
CONNECTION_UNKNOWN_DATABASE_REGEX = re.compile("Unknown database '(?P<database>.*?)'")
CONNECTION_HOST_DOWN_REGEX = re.compile(
    "Can't connect to OceanBase server on '(?P<hostname>.*?)'"
)
SYNTAX_ERROR_REGEX = re.compile(
    "check the manual that corresponds to your OceanBase server "
    "version for the right syntax to use near '(?P<server_error>.*)"
)

logger = logging.getLogger(__name__)


class NUMBER(Numeric):
    __visit_name__ = "NUMBER"


class NUMERIC(Numeric):
    __visit_name__ = "NUMERIC"


class ARRAY(TypeEngine):
    __visit_name__ = "ARRAY"

    @property
    def python_type(self) -> Optional[type[list[Any]]]:
        return list


class MAP(TypeEngine):
    __visit_name__ = "MAP"

    @property
    def python_type(self) -> Optional[type[dict[Any, Any]]]:
        return dict


class OceanBaseEngineSpec(MySQLEngineSpec):
    engine = "oceanbase"
    engine_aliases = {"oceanbase", "oceanbase_py"}
    engine_name = "OceanBase"
    max_column_name_length = 128
    default_driver = "oceanbase"

    sqlalchemy_uri_placeholder = (
        "oceanbase://user:password@host:port/db[?key=value&key=value...]"
    )
    encryption_parameters = {"ssl": "0"}
    supports_dynamic_schema = True

    metadata = {
        "description": "OceanBase is a distributed relational database.",
        "logo": "oceanbase.svg",
        "homepage_url": "https://www.oceanbase.com/",
        "categories": [
            DatabaseCategory.TRADITIONAL_RDBMS,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["oceanbase_py"],
        "connection_string": "oceanbase://{username}:{password}@{host}:{port}/{database}",
    }

    column_type_mappings = (  # type: ignore
        (
            re.compile(r"^tinyint", re.IGNORECASE),
            types.SMALLINT(),
            GenericDataType.NUMERIC,
        ),
        (
            re.compile(r"^largeint", re.IGNORECASE),
            types.BIGINT(),
            GenericDataType.NUMERIC,
        ),
        (
            re.compile(r"^decimal.*", re.IGNORECASE),
            types.DECIMAL(),
            GenericDataType.NUMERIC,
        ),
        (
            re.compile(r"^double", re.IGNORECASE),
            types.FLOAT(),
            GenericDataType.NUMERIC,
        ),
        (
            re.compile(r"^varchar(\((\d+)\))*$", re.IGNORECASE),
            types.VARCHAR(),
            GenericDataType.STRING,
        ),
        (
            re.compile(r"^char(\((\d+)\))*$", re.IGNORECASE),
            types.CHAR(),
            GenericDataType.STRING,
        ),
        (
            re.compile(r"^json.*", re.IGNORECASE),
            types.JSON(),
            GenericDataType.STRING,
        ),
        (
            re.compile(r"^binary.*", re.IGNORECASE),
            types.BINARY(),
            GenericDataType.STRING,
        ),
        (
            re.compile(r"^array.*", re.IGNORECASE),
            ARRAY(),
            GenericDataType.STRING,
        ),
        (
            re.compile(r"^map.*", re.IGNORECASE),
            MAP(),
            GenericDataType.STRING,
        ),
        (
            re.compile(r"^text.*", re.IGNORECASE),
            TEXT(),
            GenericDataType.STRING,
        ),
        (
            re.compile(r"^number.*", re.IGNORECASE),
            NUMBER(),
            GenericDataType.NUMERIC,
        ),
        (
            re.compile(r"^numeric.*", re.IGNORECASE),
            NUMERIC(),
            GenericDataType.NUMERIC,
        ),
    )

    custom_errors: dict[Pattern[str], tuple[str, ZobiErrorType, dict[str, Any]]] = {
        CONNECTION_ACCESS_DENIED_REGEX: (
            __('Either the username "%(username)s" or the password is incorrect.'),
            ZobiErrorType.CONNECTION_ACCESS_DENIED_ERROR,
            {"invalid": ["username", "password"]},
        ),
        CONNECTION_INVALID_HOSTNAME_REGEX: (
            __('Unknown OceanBase server host "%(hostname)s".'),
            ZobiErrorType.CONNECTION_INVALID_HOSTNAME_ERROR,
            {"invalid": ["host"]},
        ),
        CONNECTION_HOST_DOWN_REGEX: (
            __('The host "%(hostname)s" might be down and can\'t be reached.'),
            ZobiErrorType.CONNECTION_HOST_DOWN_ERROR,
            {"invalid": ["host", "port"]},
        ),
        CONNECTION_UNKNOWN_DATABASE_REGEX: (
            __('Unable to connect to database "%(database)s".'),
            ZobiErrorType.CONNECTION_UNKNOWN_DATABASE_ERROR,
            {"invalid": ["database"]},
        ),
        SYNTAX_ERROR_REGEX: (
            __(
                'Please check your query for syntax errors near "%(server_error)s". '
                "Then, try running your query again."
            ),
            ZobiErrorType.SYNTAX_ERROR,
            {},
        ),
    }
