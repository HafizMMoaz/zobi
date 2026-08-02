from sqlglot import parse_one

from zobi.sql.dialects.dremio import Dremio


def test_regexp_split() -> None:
    """
    Test that regexp_split works correctly in Dremio dialect.
    """
    sql = "SELECT REGEXP_SPLIT(tags, ',', 'ALL', 1000) as t"

    ast = parse_one(sql, dialect=Dremio)
    regenerated = ast.sql(dialect=Dremio)

    assert regenerated == "SELECT REGEXP_SPLIT(tags, ',', 'ALL', 1000) AS t"
