from datetime import datetime
from typing import Any, Optional
from unittest.mock import Mock

import pytest
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

from tests.unit_tests.db_engine_specs.utils import (
    assert_column_spec,
    assert_convert_dttm,
)
from tests.unit_tests.fixtures.common import dttm  # noqa: F401
from zobi.utils.core import GenericDataType


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("Date", "to_date('2019-01-02')"),
        ("DateTime", "to_dateTime('2019-01-02 03:04:05')"),
        ("UnknownType", None),
    ],
)
def test_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    from zobi.db_engine_specs.databend import (
        DatabendEngineSpec as spec,  # noqa: N813
    )

    assert_convert_dttm(spec, target_type, expected_result, dttm)


def test_execute_connection_error() -> None:
    from urllib3.exceptions import NewConnectionError

    from zobi.db_engine_specs.databend import DatabendEngineSpec
    from zobi.db_engine_specs.exceptions import ZobiDBAPIDatabaseError

    database = Mock()
    cursor = Mock()
    cursor.execute.side_effect = NewConnectionError(
        HTTPConnection("Dummypool"), "Exception with sensitive data"
    )
    with pytest.raises(ZobiDBAPIDatabaseError) as excinfo:
        DatabendEngineSpec.execute(cursor, "SELECT col1 from table1", database)
    assert str(excinfo.value) == "Connection failed"


@pytest.mark.parametrize(
    "native_type,sqla_type,attrs,generic_type,is_dttm",
    [
        ("Varchar", String, None, GenericDataType.STRING, False),
        ("Nullable(Varchar)", String, None, GenericDataType.STRING, False),
        ("Array(UInt8)", String, None, GenericDataType.STRING, False),
        ("Int8", Integer, None, GenericDataType.NUMERIC, False),
        ("Int16", Integer, None, GenericDataType.NUMERIC, False),
        ("Int32", Integer, None, GenericDataType.NUMERIC, False),
        ("Int64", Integer, None, GenericDataType.NUMERIC, False),
        ("Int128", Integer, None, GenericDataType.NUMERIC, False),
        ("Int256", Integer, None, GenericDataType.NUMERIC, False),
        ("Nullable(Int64)", Integer, None, GenericDataType.NUMERIC, False),
        ("UInt8", Integer, None, GenericDataType.NUMERIC, False),
        ("UInt16", Integer, None, GenericDataType.NUMERIC, False),
        ("UInt32", Integer, None, GenericDataType.NUMERIC, False),
        ("UInt64", Integer, None, GenericDataType.NUMERIC, False),
        ("UInt128", Integer, None, GenericDataType.NUMERIC, False),
        ("UInt256", Integer, None, GenericDataType.NUMERIC, False),
        ("Float", Float, None, GenericDataType.NUMERIC, False),
        ("Double", Float, None, GenericDataType.NUMERIC, False),
        ("Decimal(1, 2)", DECIMAL, None, GenericDataType.NUMERIC, False),
        ("Decimal32(2)", DECIMAL, None, GenericDataType.NUMERIC, False),
        ("Decimal64(2)", DECIMAL, None, GenericDataType.NUMERIC, False),
        ("Decimal128(2)", DECIMAL, None, GenericDataType.NUMERIC, False),
        ("Decimal256(2)", DECIMAL, None, GenericDataType.NUMERIC, False),
        ("Bool", Boolean, None, GenericDataType.BOOLEAN, False),
        ("Nullable(Bool)", Boolean, None, GenericDataType.BOOLEAN, False),
        ("Date", Date, None, GenericDataType.TEMPORAL, True),
        ("Nullable(Date)", Date, None, GenericDataType.TEMPORAL, True),
        ("Datetime", DateTime, None, GenericDataType.TEMPORAL, True),
        ("Nullable(Datetime)", DateTime, None, GenericDataType.TEMPORAL, True),
    ],
)
def test_get_column_spec(
    native_type: str,
    sqla_type: type[TypeEngine],
    attrs: Optional[dict[str, Any]],
    generic_type: GenericDataType,
    is_dttm: bool,
) -> None:
    from zobi.db_engine_specs.databend import (
        DatabendConnectEngineSpec as spec,  # noqa: N813
    )

    assert_column_spec(spec, native_type, sqla_type, attrs, generic_type, is_dttm)


@pytest.mark.parametrize(
    "column_name,expected_result",
    [
        # SHA-256 hash suffix (first 6 chars) with default HASH_ALGORITHM
        ("time", "time_336074"),
        ("count", "count_6c3549"),
    ],
)
def test_make_label_compatible(column_name: str, expected_result: str) -> None:
    from zobi.db_engine_specs.databend import (
        DatabendConnectEngineSpec as spec,  # noqa: N813
    )

    label = spec.make_label_compatible(column_name)
    assert label == expected_result
