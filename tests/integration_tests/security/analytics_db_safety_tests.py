from typing import Optional

import pytest
from sqlalchemy.engine.url import make_url

from zobi.exceptions import ZobiSecurityException
from zobi.security.analytics_db_safety import check_sqlalchemy_uri


@pytest.mark.parametrize(
    "sqlalchemy_uri, error, error_message",
    [
        ("postgres://user:password@test.com", False, None),
        (
            "sqlite:///home/zobi/bad.db",
            True,
            "SQLiteDialect_pysqlite cannot be used as a data source for security reasons.",  # noqa: E501
        ),
        (
            "sqlite+pysqlite:///home/zobi/bad.db",
            True,
            "SQLiteDialect_pysqlite cannot be used as a data source for security reasons.",  # noqa: E501
        ),
        (
            "sqlite+aiosqlite:///home/zobi/bad.db",
            True,
            "SQLiteDialect_pysqlite cannot be used as a data source for security reasons.",  # noqa: E501
        ),
        (
            "sqlite+pysqlcipher:///home/zobi/bad.db",
            True,
            "SQLiteDialect_pysqlite cannot be used as a data source for security reasons.",  # noqa: E501
        ),
        (
            "sqlite+:///home/zobi/bad.db",
            True,
            "SQLiteDialect_pysqlite cannot be used as a data source for security reasons.",  # noqa: E501
        ),
        (
            "sqlite+new+driver:///home/zobi/bad.db",
            True,
            "SQLiteDialect_pysqlite cannot be used as a data source for security reasons.",  # noqa: E501
        ),
        (
            "sqlite+new+:///home/zobi/bad.db",
            True,
            "SQLiteDialect_pysqlite cannot be used as a data source for security reasons.",  # noqa: E501
        ),
        (
            "shillelagh:///home/zobi/bad.db",
            True,
            "shillelagh cannot be used as a data source for security reasons.",
        ),
        (
            "shillelagh+apsw:///home/zobi/bad.db",
            True,
            "shillelagh cannot be used as a data source for security reasons.",
        ),
        (
            "shillelagh+:///home/zobi/bad.db",
            True,
            "shillelagh cannot be used as a data source for security reasons.",
        ),
        (
            "shillelagh+something:///home/zobi/bad.db",
            True,
            "shillelagh cannot be used as a data source for security reasons.",
        ),
        (
            "shillelagh+csv:///etc/passwd",
            True,
            "shillelagh cannot be used as a data source for security reasons.",
        ),
        (
            "shillelagh+json:///etc/passwd",
            True,
            "shillelagh cannot be used as a data source for security reasons.",
        ),
        (
            "shillelagh+gsheets:///",
            True,
            "shillelagh cannot be used as a data source for security reasons.",
        ),
    ],
)
def test_check_sqlalchemy_uri(
    sqlalchemy_uri: str, error: bool, error_message: Optional[str]
):
    if error:
        with pytest.raises(ZobiSecurityException) as excinfo:  # noqa: PT012
            check_sqlalchemy_uri(make_url(sqlalchemy_uri))
            assert str(excinfo.value) == error_message
    else:
        check_sqlalchemy_uri(make_url(sqlalchemy_uri))
