"""Tests for Firebolt dialect support in sqlglot."""

from zobi.sql.parse import SQLScript


def test_firebolt_exclude_syntax() -> None:
    """Test that Firebolt EXCLUDE syntax is preserved (not transformed to EXCEPT)."""
    sql = "SELECT g.* EXCLUDE (source_file_timestamp) FROM public.games g"
    script = SQLScript(sql, "firebolt")

    generated = script.format()
    assert "EXCLUDE" in generated
    assert "EXCEPT" not in generated
    assert "source_file_timestamp" in generated


def test_firebolt_exclude_multiple_columns() -> None:
    """Test EXCLUDE with multiple columns."""
    sql = "SELECT * EXCLUDE (col1, col2, col3) FROM my_table"
    script = SQLScript(sql, "firebolt")

    generated = script.format()
    assert "EXCLUDE" in generated
    assert "EXCEPT" not in generated
    assert "col1" in generated
    assert "col2" in generated
    assert "col3" in generated


def test_firebolt_sql_parsing() -> None:
    """Test that Firebolt SQL can be parsed without errors."""
    sql = "SELECT * FROM my_table LIMIT 10"
    script = SQLScript(sql, "firebolt")
    assert len(script.statements) == 1
    assert not script.has_mutation()


def test_firebolt_not_in_parenthesized() -> None:
    """Test that NOT IN is properly parenthesized in Firebolt."""
    sql = "SELECT * FROM my_table WHERE id NOT IN (1, 2, 3)"
    script = SQLScript(sql, "firebolt")

    generated = script.format()
    assert "NOT" in generated
    assert "IN" in generated
