from __future__ import annotations

import logging
import re
import subprocess

from zobi.models.core import Database
from zobi.sql_validators.base import BaseSQLValidator, SQLValidationAnnotation

try:
    from syntaqlite import get_binary_path
except ModuleNotFoundError:
    get_binary_path = None

logger = logging.getLogger(__name__)

DIAGNOSTIC_RE = re.compile(
    r"^(?:error|warning): (.+)\n"
    r" --> .+?:(\d+):(\d+)\n"
    r" +\|\n"
    r"\d+ \| .+\n"
    r" +\| +\^(~*)",
    re.MULTILINE,
)


class SQLiteSQLValidator(BaseSQLValidator):  # pylint: disable=too-few-public-methods
    """Validate SQL queries using the syntaqlite binary"""

    name = "SQLiteSQLValidator"

    @classmethod
    def validate(
        cls,
        sql: str,
        catalog: str | None,
        schema: str | None,
        database: Database,
    ) -> list[SQLValidationAnnotation]:
        annotations: list[SQLValidationAnnotation] = []

        if get_binary_path is None:
            return [
                SQLValidationAnnotation(
                    message=(
                        "syntaqlite is not installed. Install it with: "
                        'pip install "zobi[sqlite]"'
                    ),
                    line_number=None,
                    start_column=None,
                    end_column=None,
                )
            ]

        try:
            result = subprocess.run(  # noqa: S603
                [
                    get_binary_path(),
                    "--no-config",
                    "validate",
                    "--allow",
                    "schema",
                ],
                input=sql,
                capture_output=True,
                text=True,
                timeout=10,
            )
        except FileNotFoundError:
            logger.warning("syntaqlite binary not found")
            return [
                SQLValidationAnnotation(
                    message=(
                        "syntaqlite binary not found. Ensure it is correctly installed "
                        'via "pip install \\"zobi[sqlite]\\"" and available '
                        "on the system PATH."
                    ),
                    line_number=None,
                    start_column=None,
                    end_column=None,
                )
            ]
        except subprocess.TimeoutExpired:
            logger.warning("syntaqlite timed out validating SQL")
            return [
                SQLValidationAnnotation(
                    message="SQL validation timed out — the query may be too complex.",
                    line_number=None,
                    start_column=None,
                    end_column=None,
                )
            ]

        if result.returncode == 0:
            return annotations

        output = (result.stderr or result.stdout).replace("\r\n", "\n")
        for match in DIAGNOSTIC_RE.finditer(output):
            message = match.group(1)
            line_number = int(match.group(2))
            start_column = int(match.group(3))
            # The caret (^) plus tildes (~) span the error token
            end_column = start_column + 1 + len(match.group(4))

            annotations.append(
                SQLValidationAnnotation(
                    message=message,
                    line_number=line_number,
                    start_column=start_column,
                    end_column=end_column,
                )
            )

        # If we couldn't parse the output but got a non-zero exit, add a generic error
        if not annotations and result.returncode != 0:
            annotations.append(
                SQLValidationAnnotation(
                    message=output.strip() or "SQL syntax validation failed",
                    line_number=None,
                    start_column=None,
                    end_column=None,
                )
            )

        return annotations
