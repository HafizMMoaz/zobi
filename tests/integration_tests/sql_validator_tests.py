# isort:skip_file
"""Unit tests for Sql Lab"""

import unittest
from unittest.mock import MagicMock, patch

from pyhive.exc import DatabaseError

from zobi.sql_validators.postgres import PostgreSQLValidator
from zobi.sql_validators.presto_db import (
    PrestoDBSQLValidator,
    PrestoSQLValidationError,
)
from zobi.utils.database import get_example_database

from .base_tests import ZobiTestCase


class TestPrestoValidator(ZobiTestCase):
    """Testing for the prestodb sql validator"""

    def setUp(self):
        self.validator = PrestoDBSQLValidator
        self.database = MagicMock()
        self.database_engine = (
            self.database.get_sqla_engine.return_value.__enter__.return_value
        )
        self.database_conn = self.database_engine.raw_connection.return_value
        self.database_cursor = self.database_conn.cursor.return_value
        self.database_cursor.poll.return_value = None

    PRESTO_ERROR_TEMPLATE = {
        "errorLocation": {"lineNumber": 10, "columnNumber": 20},
        "message": "your query isn't how I like it",
    }

    @patch("zobi.utils.core.g")
    def test_validator_success(self, flask_g):
        flask_g.user.username = "nobody"
        sql = "SELECT 1 FROM default.notarealtable"
        schema = "default"

        errors = self.validator.validate(sql, None, schema, self.database)

        assert [] == errors

    @patch("zobi.utils.core.g")
    def test_validator_db_error(self, flask_g):
        flask_g.user.username = "nobody"
        sql = "SELECT 1 FROM default.notarealtable"
        schema = "default"

        fetch_fn = self.database.db_engine_spec.fetch_data
        fetch_fn.side_effect = DatabaseError("dummy db error")

        with self.assertRaises(PrestoSQLValidationError):  # noqa: PT027
            self.validator.validate(sql, None, schema, self.database)

    @patch("zobi.utils.core.g")
    def test_validator_unexpected_error(self, flask_g):
        flask_g.user.username = "nobody"
        sql = "SELECT 1 FROM default.notarealtable"
        schema = "default"

        fetch_fn = self.database.db_engine_spec.fetch_data
        fetch_fn.side_effect = Exception("a mysterious failure")

        with self.assertRaises(Exception):  # noqa: B017, PT027
            self.validator.validate(sql, None, schema, self.database)

    @patch("zobi.utils.core.g")
    def test_validator_query_error(self, flask_g):
        flask_g.user.username = "nobody"
        sql = "SELECT 1 FROM default.notarealtable"
        schema = "default"

        fetch_fn = self.database.db_engine_spec.fetch_data
        fetch_fn.side_effect = DatabaseError(self.PRESTO_ERROR_TEMPLATE)

        errors = self.validator.validate(sql, None, schema, self.database)

        assert 1 == len(errors)


class TestPostgreSQLValidator(ZobiTestCase):
    def test_valid_syntax(self):
        if get_example_database().backend != "postgresql":
            return

        mock_database = MagicMock()
        annotations = PostgreSQLValidator.validate(
            sql='SELECT 1, "col" FROM "table"',
            catalog=None,
            schema="",
            database=mock_database,
        )
        assert annotations == []

    def test_invalid_syntax(self):
        if get_example_database().backend != "postgresql":
            return

        mock_database = MagicMock()
        annotations = PostgreSQLValidator.validate(
            sql='SELECT 1, "col"\nFROOM "table"',
            catalog=None,
            schema="",
            database=mock_database,
        )

        assert len(annotations) == 1
        annotation = annotations[0]
        assert annotation.line_number == 2
        assert annotation.start_column is None
        assert annotation.end_column is None
        assert annotation.message == 'ERROR: syntax error at or near """'


if __name__ == "__main__":
    unittest.main()
