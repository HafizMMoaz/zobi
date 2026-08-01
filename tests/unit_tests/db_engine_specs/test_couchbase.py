
from datetime import datetime
from typing import Any, Optional, Union

import pytest
from sqlalchemy import types

from zobi.utils.core import GenericDataType
from tests.unit_tests.db_engine_specs.utils import (
    assert_column_spec,
    assert_convert_dttm,
)
from tests.unit_tests.fixtures.common import dttm  # noqa: F401


def test_epoch_to_dttm() -> None:
    """
    DB Eng Specs (couchbase): Test epoch to dttm
    """
    from zobi.db_engine_specs.couchbase import CouchbaseEngineSpec

    assert CouchbaseEngineSpec.epoch_to_dttm() == "MILLIS_TO_STR({col} * 1000)"


def test_epoch_ms_to_dttm() -> None:
    """
    DB Eng Specs (couchbase): Test epoch ms to dttm
    """
    from zobi.db_engine_specs.couchbase import CouchbaseEngineSpec

    assert CouchbaseEngineSpec.epoch_ms_to_dttm() == "MILLIS_TO_STR({col})"


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("Date", "DATETIME(DATE_FORMAT_STR(STR_TO_UTC('2019-01-02'), 'iso8601'))"),
        (
            "DateTime",
            "DATETIME(DATE_FORMAT_STR(STR_TO_UTC('2019-01-02T03:04:05'), 'iso8601'))",
        ),
    ],
)
def test_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    from zobi.db_engine_specs.couchbase import (
        CouchbaseEngineSpec as spec,  # noqa: N813
    )

    assert_convert_dttm(spec, target_type, expected_result, dttm)


@pytest.mark.parametrize(
    "native_type,sqla_type,attrs,generic_type,is_dttm",
    [
        ("SMALLINT", types.SmallInteger, None, GenericDataType.NUMERIC, False),
        ("INTEGER", types.Integer, None, GenericDataType.NUMERIC, False),
        ("BIGINT", types.BigInteger, None, GenericDataType.NUMERIC, False),
        ("DECIMAL", types.Numeric, None, GenericDataType.NUMERIC, False),
        ("NUMERIC", types.Numeric, None, GenericDataType.NUMERIC, False),
        ("CHAR", types.String, None, GenericDataType.STRING, False),
        ("VARCHAR", types.String, None, GenericDataType.STRING, False),
        ("TEXT", types.String, None, GenericDataType.STRING, False),
        ("BOOLEAN", types.Boolean, None, GenericDataType.BOOLEAN, False),
    ],
)
def test_get_column_spec(
    native_type: str,
    sqla_type: type[types.TypeEngine],
    attrs: Union[dict[str, Any], None],
    generic_type: GenericDataType,
    is_dttm: bool,
) -> None:
    from zobi.db_engine_specs.couchbase import (
        CouchbaseEngineSpec as spec,  # noqa: N813
    )

    assert_column_spec(spec, native_type, sqla_type, attrs, generic_type, is_dttm)
