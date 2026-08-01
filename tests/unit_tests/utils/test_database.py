"""Tests for zobi.utils.database module."""

import pytest
from sqlalchemy import Sequence
from sqlalchemy.dialects import mysql, postgresql
from sqlalchemy.schema import CreateSequence
from sqlalchemy.sql.compiler import DDLCompiler

from zobi.utils.database import apply_mariadb_ddl_fix


@pytest.fixture(scope="module", autouse=True)
def setup_mariadb_ddl_fix():
    """Apply MariaDB DDL fix once per module before tests run."""
    apply_mariadb_ddl_fix()


def test_mariadb_nocycle_fix_applied():
    """Test that 'NO CYCLE' is replaced with 'NOCYCLE' for MariaDB dialect."""
    dialect = mysql.dialect()
    dialect.name = "mariadb"
    ddl_compiler = DDLCompiler(dialect, None)
    seq = Sequence("test_seq", cycle=False)

    result = ddl_compiler.visit_create_sequence(CreateSequence(seq))
    assert "NOCYCLE" in result
    assert "NO CYCLE" not in result


def test_nocycle_fix_not_applied_for_postgresql():
    """Test that 'NO CYCLE' is NOT replaced for PostgreSQL dialect."""
    dialect = postgresql.dialect()
    compiler = DDLCompiler(dialect, None)
    seq = Sequence("test_seq", cycle=False)

    result = compiler.visit_create_sequence(CreateSequence(seq))
    assert "NO CYCLE" in result
