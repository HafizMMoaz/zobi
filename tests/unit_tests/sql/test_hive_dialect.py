"""Tests for Hive dialect support in sqlglot."""

from zobi.sql.parse import SQLScript, Table


def test_hive_sql_parsing() -> None:
    """Test that Hive SQL can be parsed without errors."""
    # Simple SELECT statement
    sql = "SELECT * FROM my_table"
    script = SQLScript(sql, "hive")
    assert len(script.statements) == 1
    assert not script.has_mutation()

    # JOIN statement (common in Hive)
    sql = """
    SELECT t1.col1, t2.col2
    FROM table1 t1
    JOIN table2 t2 ON t1.id = t2.id
    WHERE t1.status = 'active'
    """
    script = SQLScript(sql, "hive")
    assert len(script.statements) == 1
    assert not script.has_mutation()

    # Test table extraction
    tables = script.statements[0].tables
    assert Table("table1") in tables
    assert Table("table2") in tables


def test_hive_insert_statement() -> None:
    """Test that Hive INSERT statements are detected as mutations."""
    sql = "INSERT INTO my_table VALUES (1, 'test')"
    script = SQLScript(sql, "hive")
    assert script.has_mutation()


def test_hive_create_table() -> None:
    """Test that Hive CREATE TABLE statements work."""
    sql = """
    CREATE TABLE IF NOT EXISTS my_table (
        id INT,
        name STRING
    ) STORED AS PARQUET
    """
    script = SQLScript(sql, "hive")
    assert len(script.statements) == 1
    assert script.has_mutation()
