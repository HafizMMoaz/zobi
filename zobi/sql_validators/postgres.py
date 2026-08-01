
from __future__ import annotations

import re

from pgsanity.pgsanity import check_string

from zobi.models.core import Database
from zobi.sql_validators.base import BaseSQLValidator, SQLValidationAnnotation


class PostgreSQLValidator(BaseSQLValidator):  # pylint: disable=too-few-public-methods
    """Validate SQL queries using the pgsanity module"""

    name = "PostgreSQLValidator"

    @classmethod
    def validate(
        cls,
        sql: str,
        catalog: str | None,
        schema: str | None,
        database: Database,
    ) -> list[SQLValidationAnnotation]:
        annotations: list[SQLValidationAnnotation] = []
        valid, error = check_string(sql, add_semicolon=True)
        if valid:
            return annotations

        match = re.match(r"^line (\d+): (.*)", error)
        line_number = int(match.group(1)) if match else None
        message = match.group(2) if match else error

        annotations.append(
            SQLValidationAnnotation(
                message=message,
                line_number=line_number,
                start_column=None,
                end_column=None,
            )
        )

        return annotations
