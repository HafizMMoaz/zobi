from datetime import datetime
from typing import Any, Optional

import pytest
from sqlalchemy import column, types
from sqlalchemy.engine.url import make_url

from tests.unit_tests.db_engine_specs.utils import (
    assert_column_spec,
    assert_convert_dttm,
)
from tests.unit_tests.fixtures.common import dttm  # noqa: F401
from zobi.db_engine_specs.denodo import DenodoEngineSpec as spec  # noqa: N813
from zobi.utils.core import GenericDataType


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("Date", "TO_DATE('yyyy-MM-dd', '2019-01-02')"),
        (
            "DateTime",
            "TO_TIMESTAMP('yyyy-MM-dd HH:mm:ss.SSS', '2019-01-02 03:04:05.678')",
        ),
        (
            "TimeStamp",
            "TO_TIMESTAMP('yyyy-MM-dd HH:mm:ss.SSS', '2019-01-02 03:04:05.678')",
        ),
        ("UnknownType", None),
    ],
)
def test_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    assert_convert_dttm(spec, target_type, expected_result, dttm)


def test_epoch_to_dttm(
    dttm: datetime,  # noqa: F811
) -> None:
    assert isinstance(dttm, datetime)
    assert (
        spec.epoch_to_dttm().format(col="epoch_dttm") == "GETTIMEFROMMILLIS(epoch_dttm)"
    )


@pytest.mark.parametrize(
    "native_type,sqla_type,attrs,generic_type,is_dttm",
    [
        ("SMALLINT", types.SmallInteger, None, GenericDataType.NUMERIC, False),
        ("INTEGER", types.Integer, None, GenericDataType.NUMERIC, False),
        ("BIGINT", types.BigInteger, None, GenericDataType.NUMERIC, False),
        ("DECIMAL", types.Numeric, None, GenericDataType.NUMERIC, False),
        ("NUMERIC", types.Numeric, None, GenericDataType.NUMERIC, False),
        ("REAL", types.REAL, None, GenericDataType.NUMERIC, False),
        ("MONEY", types.Numeric, None, GenericDataType.NUMERIC, False),
        # String
        ("CHAR", types.String, None, GenericDataType.STRING, False),
        ("VARCHAR", types.String, None, GenericDataType.STRING, False),
        ("TEXT", types.String, None, GenericDataType.STRING, False),
        # Temporal
        ("DATE", types.Date, None, GenericDataType.TEMPORAL, True),
        ("TIMESTAMP", types.TIMESTAMP, None, GenericDataType.TEMPORAL, True),
        ("TIME", types.Time, None, GenericDataType.TEMPORAL, True),
        # Boolean
        ("BOOLEAN", types.Boolean, None, GenericDataType.BOOLEAN, False),
    ],
)
def test_get_column_spec(
    native_type: str,
    sqla_type: type[types.TypeEngine],
    attrs: Optional[dict[str, Any]],
    generic_type: GenericDataType,
    is_dttm: bool,
) -> None:
    assert_column_spec(spec, native_type, sqla_type, attrs, generic_type, is_dttm)


def test_get_schema_from_engine_params() -> None:
    """
    Test the ``get_schema_from_engine_params`` method.
    Should return None.
    """

    assert (
        spec.get_schema_from_engine_params(
            make_url("denodo://user:password@host/db"), {}
        )
        is None
    )


def test_get_default_catalog() -> None:
    """
    Test ``get_default_catalog``.
    Should return None.
    """
    from zobi.models.core import Database

    database = Database(
        database_name="denodo",
        sqlalchemy_uri="denodo://user:password@host:9996/db",
    )
    assert spec.get_default_catalog(database) is None


@pytest.mark.parametrize(
    "time_grain,expected_result",
    [
        (None, "col"),
        ("PT1M", "TRUNC(col,'MI')"),
        ("PT1H", "TRUNC(col,'HH')"),
        ("P1D", "TRUNC(col,'DDD')"),
        ("P1W", "TRUNC(col,'W')"),
        ("P1M", "TRUNC(col,'MONTH')"),
        ("P3M", "TRUNC(col,'Q')"),
        ("P1Y", "TRUNC(col,'YEAR')"),
    ],
)
def test_timegrain_expressions(time_grain: str, expected_result: str) -> None:
    """
    DB Eng Specs (denodo): Test time grain expressions
    """
    actual = str(
        spec.get_timestamp_expr(col=column("col"), pdf=None, time_grain=time_grain)
    )
    assert actual == expected_result
