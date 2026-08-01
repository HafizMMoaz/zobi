import logging
from functools import partial
from typing import Any, Optional

from flask import current_app as app
from flask_appbuilder.models.sqla import Model
from marshmallow import ValidationError

from zobi.commands.base import BaseCommand
from zobi.commands.database.exceptions import (
    DatabaseConnectionFailedError,
    DatabaseCreateFailedError,
    DatabaseExistsValidationError,
    DatabaseInvalidError,
    DatabaseRequiredFieldValidationError,
)
from zobi.commands.database.ssh_tunnel.exceptions import (
    SSHTunnelCreateFailedError,
    SSHTunnelDatabasePortError,
    SSHTunnelingNotEnabledError,
    SSHTunnelInvalidError,
)
from zobi.commands.database.test_connection import TestConnectionDatabaseCommand
from zobi.commands.database.utils import add_permissions
from zobi.daos.database import DatabaseDAO
from zobi.databases.utils import make_url_safe
from zobi.exceptions import OAuth2RedirectError, ZobiErrorsException
from zobi.extensions import event_logger
from zobi.models.core import Database
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)
stats_logger = app.config["STATS_LOGGER"]


class CreateDatabaseCommand(BaseCommand):
    def __init__(self, data: dict[str, Any]):
        self._properties = data.copy()

    @transaction(on_error=partial(on_error, reraise=DatabaseCreateFailedError))
    def run(self) -> Model:
        self.validate()

        if "sqlalchemy_uri" not in self._properties:
            raise DatabaseRequiredFieldValidationError("sqlalchemy_uri")

        url = make_url_safe(self._properties["sqlalchemy_uri"])
        engine = url.get_backend_name()

        try:
            # Test connection before starting create transaction
            TestConnectionDatabaseCommand(self._properties).run()
        except OAuth2RedirectError:
            # If we can't connect to the database due to an OAuth2 error we can still
            # save the database. Later, the user can sync permissions when setting up
            # data access rules.
            return self._create_database()
        except (
            ZobiErrorsException,
            SSHTunnelingNotEnabledError,
            SSHTunnelDatabasePortError,
        ) as ex:
            event_logger.log_with_context(
                action=f"db_creation_failed.{ex.__class__.__name__}",
                engine=engine,
            )
            # So we can show the original message
            raise
        except Exception as ex:
            event_logger.log_with_context(
                action=f"db_creation_failed.{ex.__class__.__name__}",
                engine=engine,
            )
            raise DatabaseConnectionFailedError() from ex

        try:
            # create database and associated schema/catalog permissions
            database = self._create_database()
            add_permissions(database)
        except (
            SSHTunnelInvalidError,
            SSHTunnelCreateFailedError,
            SSHTunnelingNotEnabledError,
            SSHTunnelDatabasePortError,
        ) as ex:
            event_logger.log_with_context(
                action=f"db_creation_failed.{ex.__class__.__name__}.ssh_tunnel",
                engine=engine,
            )
            # So we can show the original message
            raise
        except (
            DatabaseInvalidError,
            Exception,
        ) as ex:
            event_logger.log_with_context(
                action=f"db_creation_failed.{ex.__class__.__name__}",
                engine=engine,
            )
            raise DatabaseCreateFailedError() from ex

        return database

    def validate(self) -> None:
        exceptions: list[ValidationError] = []

        sqlalchemy_uri: Optional[str] = self._properties.get("sqlalchemy_uri")
        if not sqlalchemy_uri:
            exceptions.append(DatabaseRequiredFieldValidationError("sqlalchemy_uri"))

        database_name: Optional[str] = self._properties.get("database_name")
        if not database_name:
            exceptions.append(DatabaseRequiredFieldValidationError("database_name"))
        else:
            if not DatabaseDAO.validate_uniqueness(database_name):
                exceptions.append(DatabaseExistsValidationError())

        if exceptions:
            exception = DatabaseInvalidError()
            exception.extend(exceptions)
            event_logger.log_with_context(
                # pylint: disable=consider-using-f-string
                action="db_connection_failed.{}.{}".format(
                    exception.__class__.__name__,
                    ".".join(exception.get_list_classnames()),
                )
            )
            raise exception

    def _create_database(self) -> Database:
        # when creating a new database we don't need to unmask encrypted extra
        self._properties["encrypted_extra"] = self._properties.pop(
            "masked_encrypted_extra",
            "{}",
        )

        database = DatabaseDAO.create(attributes=self._properties)
        database.set_sqlalchemy_uri(database.sqlalchemy_uri)

        return database
