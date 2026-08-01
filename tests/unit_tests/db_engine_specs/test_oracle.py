from datetime import datetime
from typing import Optional, Union
from unittest import mock

import pytest
from sqlalchemy import column, types
from sqlalchemy.dialects import oracle
from sqlalchemy.dialects.oracle import DATE, NVARCHAR, VARCHAR
from sqlalchemy.sql import quoted_name

from tests.unit_tests.db_engine_specs.utils import assert_convert_dttm
from tests.unit_tests.fixtures.common import dttm  # noqa: F401


@pytest.mark.parametrize(
    "column_name,expected_result",
    [
        # SHA-256 hash of 129 'a' characters with default HASH_ALGORITHM
        ("a" * 129, "c12cb024a2e5551cca0e08fce8f1c5e314555cc3fef6329ee994a3db752166ae"),
        ("snake_label", "snake_label"),
        ("camelLabel", "camelLabel"),
    ],
)
def test_oracle_sqla_column_name_length_exceeded(
    column_name: str, expected_result: Union[str, quoted_name]
) -> None:
    from zobi.db_engine_specs.oracle import OracleEngineSpec

    label = OracleEngineSpec.make_label_compatible(column_name)
    assert isinstance(label, quoted_name)
    assert label.quote is True
    assert label == expected_result


def test_oracle_time_expression_reserved_keyword_1m_grain() -> None:
    from zobi.db_engine_specs.oracle import OracleEngineSpec

    col = column("decimal")
    expr = OracleEngineSpec.get_timestamp_expr(col, None, "P1M")
    result = str(expr.compile(dialect=oracle.dialect()))
    assert result == "TRUNC(CAST(\"decimal\" as DATE), 'MONTH')"


@pytest.mark.parametrize(
    "sqla_type,expected_result",
    [
        (DATE(), "DATE"),
        (VARCHAR(length=255), "VARCHAR(255 CHAR)"),
        (VARCHAR(length=255, collation="utf8"), "VARCHAR(255 CHAR)"),
        (NVARCHAR(length=128), "NVARCHAR2(128)"),
    ],
)
def test_column_datatype_to_string(
    sqla_type: types.TypeEngine, expected_result: str
) -> None:
    from zobi.db_engine_specs.oracle import OracleEngineSpec

    assert (
        OracleEngineSpec.column_datatype_to_string(sqla_type, oracle.dialect())
        == expected_result
    )


def test_fetch_data_no_description() -> None:
    from zobi.db_engine_specs.oracle import OracleEngineSpec

    cursor = mock.MagicMock()
    cursor.description = []
    assert OracleEngineSpec.fetch_data(cursor) == []


def test_fetch_data() -> None:
    from zobi.db_engine_specs.oracle import OracleEngineSpec

    cursor = mock.MagicMock()
    result = ["a", "b"]
    cursor.fetchall.return_value = result
    assert OracleEngineSpec.fetch_data(cursor) == result


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("Date", "TO_DATE('2019-01-02', 'YYYY-MM-DD')"),
        ("DateTime", """TO_DATE('2019-01-02T03:04:05', 'YYYY-MM-DD"T"HH24:MI:SS')"""),
        (
            "TimeStamp",
            """TO_TIMESTAMP('2019-01-02T03:04:05.678900', 'YYYY-MM-DD"T"HH24:MI:SS.ff6')""",  # noqa: E501
        ),
        ("Other", None),
    ],
)
def test_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    from zobi.db_engine_specs.oracle import OracleEngineSpec as spec  # noqa: N813

    assert_convert_dttm(spec, target_type, expected_result, dttm)


@pytest.mark.parametrize(
    "name,expected_result",
    [
        ("col", "COL"),
        ("Col", "Col"),
        ("COL", "COL"),
    ],
)
def test_denormalize_name(name: str, expected_result: str):
    from zobi.db_engine_specs.oracle import OracleEngineSpec as spec  # noqa: N813

    assert spec.denormalize_name(oracle.dialect(), name) == expected_result
