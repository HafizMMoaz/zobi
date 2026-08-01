
import pytest
from pytest_mock import MockerFixture

from zobi.commands.database.exceptions import (
    DatabaseOfflineError,
    DatabaseTestConnectionFailedError,
    InvalidParametersError,
)
from zobi.commands.database.validate import ValidateDatabaseParametersCommand
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType


def test_command(mocker: MockerFixture) -> None:
    """
    Test the happy path of the command.
    """
    user = mocker.MagicMock()
    user.email = "alice@example.org"
    mocker.patch("zobi.db_engine_specs.gsheets.g", user=user)
    mocker.patch("zobi.db_engine_specs.gsheets.create_engine")

    database = mocker.MagicMock()
    with database.get_sqla_engine() as engine:
        engine.dialect.do_ping.return_value = True

    DatabaseDAO = mocker.patch("zobi.commands.database.validate.DatabaseDAO")  # noqa: N806
    DatabaseDAO.build_db_for_connection_test.return_value = database

    properties = {
        "engine": "gsheets",
        "driver": "gsheets",
        "catalog": {"test": "https://example.org/"},
    }
    command = ValidateDatabaseParametersCommand(properties)
    command.run()


def test_command_invalid(mocker: MockerFixture) -> None:
    """
    Test the command when the payload is invalid.
    """
    user = mocker.MagicMock()
    user.email = "alice@example.org"
    mocker.patch("zobi.db_engine_specs.gsheets.g", user=user)
    mocker.patch("zobi.db_engine_specs.gsheets.create_engine")

    database = mocker.MagicMock()
    with database.get_sqla_engine() as engine:
        engine.dialect.do_ping.return_value = True

    DatabaseDAO = mocker.patch("zobi.commands.database.validate.DatabaseDAO")  # noqa: N806
    DatabaseDAO.build_db_for_connection_test.return_value = database

    properties = {
        "engine": "gsheets",
        "driver": "gsheets",
        "catalog": {"": "https://example.org/"},
    }
    command = ValidateDatabaseParametersCommand(properties)
    with pytest.raises(InvalidParametersError) as excinfo:
        command.run()
    assert excinfo.value.errors == [
        ZobiError(
            message="Sheet name is required",
            error_type=ZobiErrorType.CONNECTION_MISSING_PARAMETERS_ERROR,
            level=ErrorLevel.WARNING,
            extra={
                "catalog": {"idx": 0, "name": True},
                "issue_codes": [
                    {
                        "code": 1018,
                        "message": (
                            "Issue 1018 - One or more parameters needed to configure a "
                            "database are missing."
                        ),
                    }
                ],
            },
        )
    ]


def test_command_no_ping(mocker: MockerFixture) -> None:
    """
    Test the command when it can't ping the database.
    """
    user = mocker.MagicMock()
    user.email = "alice@example.org"
    mocker.patch("zobi.db_engine_specs.gsheets.g", user=user)
    mocker.patch("zobi.db_engine_specs.gsheets.create_engine")

    database = mocker.MagicMock()
    with database.get_sqla_engine() as engine:
        engine.dialect.do_ping.return_value = False

    DatabaseDAO = mocker.patch("zobi.commands.database.validate.DatabaseDAO")  # noqa: N806
    DatabaseDAO.build_db_for_connection_test.return_value = database

    properties = {
        "engine": "gsheets",
        "driver": "gsheets",
        "catalog": {"test": "https://example.org/"},
    }
    command = ValidateDatabaseParametersCommand(properties)
    with pytest.raises(DatabaseOfflineError) as excinfo:
        command.run()
    assert excinfo.value.error == ZobiError(
        message="Database is offline.",
        error_type=ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
        level=ErrorLevel.ERROR,
        extra={
            "issue_codes": [
                {
                    "code": 1002,
                    "message": "Issue 1002 - The database returned an unexpected error.",  # noqa: E501
                }
            ]
        },
    )


def test_command_with_oauth2(mocker: MockerFixture) -> None:
    """
    Test the command when OAuth2 is needed.
    """
    user = mocker.MagicMock()
    user.email = "alice@example.org"
    mocker.patch("zobi.db_engine_specs.gsheets.g", user=user)
    mocker.patch("zobi.db_engine_specs.gsheets.create_engine")

    database = mocker.MagicMock()
    database.is_oauth2_enabled.return_value = True
    database.db_engine_spec.needs_oauth2.return_value = True
    with database.get_sqla_engine() as engine:
        engine.dialect.do_ping.side_effect = Exception("OAuth2 needed")

    DatabaseDAO = mocker.patch("zobi.commands.database.validate.DatabaseDAO")  # noqa: N806
    DatabaseDAO.build_db_for_connection_test.return_value = database

    properties = {
        "engine": "gsheets",
        "driver": "gsheets",
        "catalog": {"test": "https://example.org/"},
    }
    command = ValidateDatabaseParametersCommand(properties)
    command.run()


def test_command_with_oauth2_not_configured(mocker: MockerFixture) -> None:
    """
    Test the command when OAuth2 is needed but not configured in the DB.
    """
    user = mocker.MagicMock()
    user.email = "alice@example.org"
    mocker.patch("zobi.db_engine_specs.gsheets.g", user=user)
    mocker.patch("zobi.db_engine_specs.gsheets.create_engine")

    database = mocker.MagicMock()
    database.is_oauth2_enabled.return_value = False
    database.db_engine_spec.needs_oauth2.return_value = True
    database.db_engine_spec.extract_errors.return_value = [
        ZobiError(
            error_type=ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
            message="OAuth2 is needed but not configured.",
            level=ErrorLevel.ERROR,
            extra={"engine_name": "gsheets"},
        )
    ]
    with database.get_sqla_engine() as engine:
        engine.dialect.do_ping.side_effect = Exception("OAuth2 needed")

    DatabaseDAO = mocker.patch("zobi.commands.database.validate.DatabaseDAO")  # noqa: N806
    DatabaseDAO.build_db_for_connection_test.return_value = database

    properties = {
        "engine": "gsheets",
        "driver": "gsheets",
        "catalog": {"test": "https://example.org/"},
    }
    command = ValidateDatabaseParametersCommand(properties)
    with pytest.raises(DatabaseTestConnectionFailedError) as excinfo:
        command.run()
    assert excinfo.value.errors == [
        ZobiError(
            error_type=ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
            message="OAuth2 is needed but not configured.",
            level=ErrorLevel.ERROR,
            extra={"engine_name": "gsheets"},
        )
    ]
