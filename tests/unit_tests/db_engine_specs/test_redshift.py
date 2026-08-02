from datetime import datetime
from typing import Optional

import pytest

from tests.unit_tests.db_engine_specs.utils import assert_convert_dttm
from tests.unit_tests.fixtures.common import dttm  # noqa: F401
from zobi.db_engine_specs.redshift import RedshiftEngineSpec


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("Date", "TO_DATE('2019-01-02', 'YYYY-MM-DD')"),
        (
            "DateTime",
            "TO_TIMESTAMP('2019-01-02 03:04:05.678900', 'YYYY-MM-DD HH24:MI:SS.US')",
        ),
        (
            "TimeStamp",
            "TO_TIMESTAMP('2019-01-02 03:04:05.678900', 'YYYY-MM-DD HH24:MI:SS.US')",
        ),
        ("UnknownType", None),
    ],
)
def test_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    from zobi.db_engine_specs.redshift import (
        RedshiftEngineSpec as spec,  # noqa: N813
    )

    assert_convert_dttm(spec, target_type, expected_result, dttm)


@pytest.mark.parametrize(
    "table_name,schema_name,expected_table,expected_schema",
    [
        ("BPO_mytest_2", "MySchema", "bpo_mytest_2", "myschema"),
        ("MY_TABLE", None, "my_table", None),
        ("already_lower", "lower_schema", "already_lower", "lower_schema"),
    ],
)
def test_normalize_table_name_for_upload(
    table_name: str,
    schema_name: Optional[str],
    expected_table: str,
    expected_schema: Optional[str],
) -> None:
    """
    Test that table and schema names are normalized to lowercase for Redshift.

    Redshift folds unquoted identifiers to lowercase, so we need to normalize
    table names to ensure consistent behavior when checking table existence
    and performing replace operations.
    """
    normalized_table, normalized_schema = (
        RedshiftEngineSpec.normalize_table_name_for_upload(table_name, schema_name)
    )

    assert normalized_table == expected_table
    assert normalized_schema == expected_schema
