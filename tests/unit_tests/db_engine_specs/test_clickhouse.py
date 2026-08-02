from datetime import datetime
from typing import Any, Optional
from unittest.mock import Mock

import pytest
from sqlalchemy.engine.url import make_url
from sqlalchemy.types import (
    Boolean,
    Date,
    DateTime,
    DECIMAL,
    Float,
    Integer,
    String,
    TypeEngine,
)
from urllib3.connection import HTTPConnection
from urllib3.exceptions import NewConnectionError

from tests.unit_tests.db_engine_specs.utils import (
    assert_column_spec,
    assert_convert_dttm,
)
from tests.unit_tests.fixtures.common import dttm  # noqa: F401
from zobi.utils.core import GenericDataType


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("Date", "toDate('2019-01-02')"),
        ("DateTime", "toDateTime('2019-01-02 03:04:05')"),
        ("UnknownType", None),
    ],
)
def test_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    from zobi.db_engine_specs.clickhouse import (
        ClickHouseEngineSpec as spec,  # noqa: N813
    )

    assert_convert_dttm(spec, target_type, expected_result, dttm)


def test_execute_connection_error() -> None:
    from zobi.db_engine_specs.clickhouse import ClickHouseEngineSpec
    from zobi.db_engine_specs.exceptions import ZobiDBAPIDatabaseError

    database = Mock()
    cursor = Mock()
    cursor.execute.side_effect = NewConnectionError(
        HTTPConnection("localhost"), "Exception with sensitive data"
    )
    with pytest.raises(ZobiDBAPIDatabaseError) as excinfo:
        ClickHouseEngineSpec.execute(cursor, "SELECT col1 from table1", database)
    assert str(excinfo.value) == "Connection failed"


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("Date", "toDate('2019-01-02')"),
        ("DateTime", "toDateTime('2019-01-02 03:04:05')"),
        ("UnknownType", None),
    ],
)
def test_connect_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    from zobi.db_engine_specs.clickhouse import (
        ClickHouseEngineSpec as spec,  # noqa: N813
    )

    assert_convert_dttm(spec, target_type, expected_result, dttm)


@pytest.mark.parametrize(
    "native_type,sqla_type,attrs,generic_type,is_dttm",
    [
        ("String", String, None, GenericDataType.STRING, False),
        ("LowCardinality(String)", String, None, GenericDataType.STRING, False),
        ("Nullable(String)", String, None, GenericDataType.STRING, False),
        (
            "LowCardinality(Nullable(String))",
            String,
            None,
            GenericDataType.STRING,
            False,
        ),
        ("Array(UInt8)", String, None, GenericDataType.STRING, False),
        ("Enum('hello', 'world')", String, None, GenericDataType.STRING, False),
        ("Enum('UInt32', 'Bool')", String, None, GenericDataType.STRING, False),
        (
            "LowCardinality(Enum('hello', 'world'))",
            String,
            None,
            GenericDataType.STRING,
            False,
        ),
        (
            "Nullable(Enum('hello', 'world'))",
            String,
            None,
            GenericDataType.STRING,
            False,
        ),
        (
            "LowCardinality(Nullable(Enum('hello', 'world')))",
            String,
            None,
            GenericDataType.STRING,
            False,
        ),
        ("FixedString(16)", String, None, GenericDataType.STRING, False),
        ("Nullable(FixedString(16))", String, None, GenericDataType.STRING, False),
        (
            "LowCardinality(Nullable(FixedString(16)))",
            String,
            None,
            GenericDataType.STRING,
            False,
        ),
        ("UUID", String, None, GenericDataType.STRING, False),
        ("Int8", Integer, None, GenericDataType.NUMERIC, False),
        ("Int16", Integer, None, GenericDataType.NUMERIC, False),
        ("Int32", Integer, None, GenericDataType.NUMERIC, False),
        ("Int64", Integer, None, GenericDataType.NUMERIC, False),
        ("Int128", Integer, None, GenericDataType.NUMERIC, False),
        ("Int256", Integer, None, GenericDataType.NUMERIC, False),
        ("Nullable(Int256)", Integer, None, GenericDataType.NUMERIC, False),
        (
            "LowCardinality(Nullable(Int256))",
            Integer,
            None,
            GenericDataType.NUMERIC,
            False,
        ),
        ("UInt8", Integer, None, GenericDataType.NUMERIC, False),
        ("UInt16", Integer, None, GenericDataType.NUMERIC, False),
        ("UInt32", Integer, None, GenericDataType.NUMERIC, False),
        ("UInt64", Integer, None, GenericDataType.NUMERIC, False),
        ("UInt128", Integer, None, GenericDataType.NUMERIC, False),
        ("UInt256", Integer, None, GenericDataType.NUMERIC, False),
        ("Nullable(UInt256)", Integer, None, GenericDataType.NUMERIC, False),
        (
            "LowCardinality(Nullable(UInt256))",
            Integer,
            None,
            GenericDataType.NUMERIC,
            False,
        ),
        ("Float32", Float, None, GenericDataType.NUMERIC, False),
        ("Float64", Float, None, GenericDataType.NUMERIC, False),
        ("Decimal(1, 2)", DECIMAL, None, GenericDataType.NUMERIC, False),
        ("Decimal32(2)", DECIMAL, None, GenericDataType.NUMERIC, False),
        ("Decimal64(2)", DECIMAL, None, GenericDataType.NUMERIC, False),
        ("Decimal128(2)", DECIMAL, None, GenericDataType.NUMERIC, False),
        ("Decimal256(2)", DECIMAL, None, GenericDataType.NUMERIC, False),
        ("Bool", Boolean, None, GenericDataType.BOOLEAN, False),
        ("Nullable(Bool)", Boolean, None, GenericDataType.BOOLEAN, False),
        ("Date", Date, None, GenericDataType.TEMPORAL, True),
        ("Nullable(Date)", Date, None, GenericDataType.TEMPORAL, True),
        ("LowCardinality(Nullable(Date))", Date, None, GenericDataType.TEMPORAL, True),
        ("Date32", Date, None, GenericDataType.TEMPORAL, True),
        ("Datetime", DateTime, None, GenericDataType.TEMPORAL, True),
        ("Nullable(Datetime)", DateTime, None, GenericDataType.TEMPORAL, True),
        (
            "LowCardinality(Nullable(Datetime))",
            DateTime,
            None,
            GenericDataType.TEMPORAL,
            True,
        ),
        ("Datetime('UTC')", DateTime, None, GenericDataType.TEMPORAL, True),
        ("Datetime64(3)", DateTime, None, GenericDataType.TEMPORAL, True),
        ("Datetime64(3, 'UTC')", DateTime, None, GenericDataType.TEMPORAL, True),
    ],
)
def test_connect_get_column_spec(
    native_type: str,
    sqla_type: type[TypeEngine],
    attrs: Optional[dict[str, Any]],
    generic_type: GenericDataType,
    is_dttm: bool,
) -> None:
    from zobi.db_engine_specs.clickhouse import (
        ClickHouseConnectEngineSpec as spec,  # noqa: N813
    )

    assert_column_spec(spec, native_type, sqla_type, attrs, generic_type, is_dttm)


@pytest.mark.parametrize(
    "schema, expected_result",
    [
        (None, "clickhousedb+connect://localhost:443/__default__"),
        (
            "new_schema",
            "clickhousedb+connect://localhost:443/new_schema",
        ),
    ],
)
def test_adjust_engine_params_fully_qualified(
    schema: str, expected_result: str
) -> None:
    from zobi.db_engine_specs.clickhouse import (
        ClickHouseConnectEngineSpec as spec,  # noqa: N813
    )

    url = make_url("clickhousedb+connect://localhost:443/__default__")

    uri = spec.adjust_engine_params(url, {}, None, schema)[0]
    assert str(uri) == expected_result
