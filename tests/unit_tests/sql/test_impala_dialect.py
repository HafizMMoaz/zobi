
"""Tests for Impala dialect support in sqlglot."""

from sqlglot import Dialects

from zobi.sql.parse import SQLGLOT_DIALECTS


def test_impala_dialect_mapped() -> None:
    """Test that Impala is correctly mapped to Hive dialect."""
    assert "impala" in SQLGLOT_DIALECTS
    assert SQLGLOT_DIALECTS["impala"] == Dialects.HIVE
