from typing import Optional

from . import base, postgres, presto_db, sqlite
from .base import SQLValidationAnnotation  # noqa: F401


def get_validator_by_name(name: str) -> Optional[type[base.BaseSQLValidator]]:
    return {
        "PrestoDBSQLValidator": presto_db.PrestoDBSQLValidator,
        "PostgreSQLValidator": postgres.PostgreSQLValidator,
        "SQLiteSQLValidator": sqlite.SQLiteSQLValidator,
    }.get(name)
