from zobi.db_engine_specs.gsheets import GSheetsEngineSpec
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType
from tests.integration_tests.base_tests import ZobiTestCase


class TestGsheetsDbEngineSpec(ZobiTestCase):
    def test_extract_errors(self):
        """
        Test that custom error messages are extracted correctly.
        """
        msg = 'SQLError: near "from_": syntax error'
        result = GSheetsEngineSpec.extract_errors(Exception(msg))
        assert result == [
            ZobiError(
                message='Please check your query for syntax errors near "from_". Then, try running your query again.',  # noqa: E501
                error_type=ZobiErrorType.SYNTAX_ERROR,
                level=ErrorLevel.ERROR,
                extra={
                    "engine_name": "Google Sheets",
                    "issue_codes": [
                        {
                            "code": 1030,
                            "message": "Issue 1030 - The query has a syntax error.",
                        }
                    ],
                },
            )
        ]
