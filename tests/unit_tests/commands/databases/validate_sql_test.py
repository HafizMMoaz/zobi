from typing import Any
from unittest.mock import MagicMock

import pytest
from pytest_mock import MockerFixture

from zobi.commands.database.exceptions import (
    ValidatorSQL400Error,
    ValidatorSQLError,
)
from zobi.commands.database.validate_sql import ValidateSQLCommand
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType
from zobi.exceptions import (
    ZobiSyntaxErrorException,
    ZobiTemplateException,
)


@pytest.fixture
def mock_database(mocker: MockerFixture) -> MagicMock:
    """Create a mock database with PostgreSQL engine."""
    database = mocker.MagicMock()
    database.id = 1
    database.db_engine_spec.engine = "postgresql"

    DatabaseDAO = mocker.patch(  # noqa: N806
        "zobi.commands.database.validate_sql.DatabaseDAO"
    )
    DatabaseDAO.find_by_id.return_value = database
    return database


@pytest.fixture
def mock_validator(mocker: MockerFixture) -> MagicMock:
    """Create a mock SQL validator."""
    validator = mocker.MagicMock()
    validator.name = "PostgreSQLValidator"
    validator.validate.return_value = []

    get_validator_by_name = mocker.patch(
        "zobi.commands.database.validate_sql.get_validator_by_name"
    )
    get_validator_by_name.return_value = validator
    return validator


@pytest.fixture
def mock_config(mocker: MockerFixture) -> dict[str, Any]:
    """Mock the application config."""
    config = {
        "SQL_VALIDATORS_BY_ENGINE": {"postgresql": "PostgreSQLValidator"},
        "SQLLAB_VALIDATION_TIMEOUT": 30,
    }
    mocker.patch("zobi.commands.database.validate_sql.app.config", config)
    return config


@pytest.fixture
def mock_template_processor(
    mocker: MockerFixture, mock_database: MagicMock
) -> MagicMock:
    """Create a mock template processor."""
    template_processor = mocker.MagicMock()
    get_template_processor = mocker.patch(
        "zobi.commands.database.validate_sql.get_template_processor"
    )
    get_template_processor.return_value = template_processor
    return template_processor


def test_validate_sql_with_jinja_templates(
    mock_database: MagicMock,
    mock_validator: MagicMock,
    mock_template_processor: MagicMock,
    mock_config: dict[str, Any],
) -> None:
    """Test that Jinja templates are rendered before SQL validation."""
    sql_with_jinja = """SELECT *
        FROM birth_names
        WHERE 1=1
        {% if city_filter is defined %}
            AND city = '{{ city_filter }}'
        {% endif %}
        LIMIT {{ limit | default(100) }}"""

    mock_template_processor.process_template.return_value = (
        "SELECT *\nFROM birth_names\nWHERE 1=1\nLIMIT 100"
    )

    data = {"sql": sql_with_jinja, "schema": "public", "template_params": {}}
    command = ValidateSQLCommand(model_id=1, data=data)
    result = command.run()

    mock_template_processor.process_template.assert_called_once_with(sql_with_jinja)
    mock_validator.validate.assert_called_once()
    assert result == []


def test_validate_sql_with_jinja_templates_and_params(
    mock_database: MagicMock,
    mock_validator: MagicMock,
    mock_template_processor: MagicMock,
    mock_config: dict[str, Any],
) -> None:
    """Test that Jinja templates are rendered with parameters before SQL validation."""
    sql_with_jinja = """SELECT *
        FROM birth_names
        WHERE 1=1
        {% if city_filter is defined %}
            AND city = '{{ city_filter }}'
        {% endif %}
        LIMIT {{ limit }}"""

    template_params = {"city_filter": "New York", "limit": 50}
    mock_template_processor.process_template.return_value = (
        "SELECT *\nFROM birth_names\nWHERE 1=1\n    AND city = 'New York'\nLIMIT 50"
    )

    data = {
        "sql": sql_with_jinja,
        "schema": "public",
        "template_params": template_params,
    }
    command = ValidateSQLCommand(model_id=1, data=data)
    result = command.run()

    mock_template_processor.process_template.assert_called_once_with(
        sql_with_jinja, **template_params
    )
    mock_validator.validate.assert_called_once()
    assert result == []


def test_validate_sql_without_jinja_templates(
    mock_database: MagicMock,
    mock_validator: MagicMock,
    mock_template_processor: MagicMock,
    mock_config: dict[str, Any],
) -> None:
    """Test that regular SQL without Jinja templates still works."""
    simple_sql = "SELECT * FROM birth_names LIMIT 100"
    mock_template_processor.process_template.return_value = simple_sql

    data = {"sql": simple_sql, "schema": "public", "template_params": {}}
    command = ValidateSQLCommand(model_id=1, data=data)
    result = command.run()

    mock_template_processor.process_template.assert_called_once()
    mock_validator.validate.assert_called_once()
    assert result == []


def test_validate_sql_template_syntax_error(
    mock_database: MagicMock,
    mock_validator: MagicMock,
    mock_template_processor: MagicMock,
    mock_config: dict[str, Any],
) -> None:
    """
    Test that template syntax errors are properly surfaced to the client.

    When template processing raises a ZobiSyntaxErrorException (e.g.,
    invalid Jinja2 syntax, undefined variables), it should be caught and
    converted to a ValidatorSQL400Error with detailed error information
    including line numbers.
    """
    syntax_error = ZobiError(
        message="Jinja2 template error (UndefinedError): 'city_filter' is undefined",
        error_type=ZobiErrorType.GENERIC_COMMAND_ERROR,
        level=ErrorLevel.ERROR,
        extra={"template": "SELECT * FROM...", "line": 3},
    )
    mock_template_processor.process_template.side_effect = ZobiSyntaxErrorException(
        [syntax_error]
    )

    sql_with_undefined_var = """SELECT *
        FROM birth_names
        WHERE city = '{{ city_filter }}'
        LIMIT 100"""

    data = {
        "sql": sql_with_undefined_var,
        "schema": "public",
        "template_params": {},
    }
    command = ValidateSQLCommand(model_id=1, data=data)

    with pytest.raises(ValidatorSQL400Error) as exc_info:
        command.run()

    error = exc_info.value
    assert error.error.message is not None
    assert "'city_filter' is undefined" in error.error.message
    mock_validator.validate.assert_not_called()


def test_validate_sql_template_processing_error(
    mock_database: MagicMock,
    mock_validator: MagicMock,
    mock_template_processor: MagicMock,
    mock_config: dict[str, Any],
) -> None:
    """
    Test that internal template processing errors are properly surfaced to the client.

    When template processing raises a ZobiTemplateException (e.g., recursion,
    unexpected failures), it should be caught and converted to a ValidatorSQL400Error
    with an appropriate error message.
    """
    mock_template_processor.process_template.side_effect = ZobiTemplateException(
        "Infinite recursion detected in template"
    )

    data = {
        "sql": "SELECT * FROM birth_names LIMIT 100",
        "schema": "public",
        "template_params": {},
    }
    command = ValidateSQLCommand(model_id=1, data=data)

    with pytest.raises(ValidatorSQL400Error) as exc_info:
        command.run()

    error = exc_info.value
    assert error.error.message is not None
    assert "Template processing failed" in error.error.message
    assert "Infinite recursion" in error.error.message
    mock_validator.validate.assert_not_called()


def test_validate_sql_generic_exception(
    mock_database: MagicMock,
    mock_validator: MagicMock,
    mock_template_processor: MagicMock,
    mock_config: dict[str, Any],
) -> None:
    """
    Test that unexpected exceptions are still caught and handled gracefully.

    When an unexpected exception occurs (not template-related), it should be caught
    and converted to a ValidatorSQLError with the validator name in the message.
    """
    mock_template_processor.process_template.side_effect = RuntimeError(
        "Unexpected error occurred"
    )

    data = {
        "sql": "SELECT * FROM birth_names",
        "schema": "public",
        "template_params": {},
    }
    command = ValidateSQLCommand(model_id=1, data=data)

    with pytest.raises(ValidatorSQLError) as exc_info:
        command.run()

    error = exc_info.value
    assert error.error.message is not None
    assert "PostgreSQLValidator" in error.error.message
    assert "Unexpected error occurred" in error.error.message
    mock_validator.validate.assert_not_called()
