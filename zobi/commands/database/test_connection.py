import logging
from typing import Any, Optional

from flask_babel import gettext as _
from sqlalchemy.exc import DBAPIError, NoSuchModuleError

from zobi import is_feature_enabled
from zobi.commands.base import BaseCommand
from zobi.commands.database.exceptions import (
    DatabaseSecurityUnsafeError,
    DatabaseTestConnectionDriverError,
    DatabaseTestConnectionUnexpectedError,
)
from zobi.commands.database.ssh_tunnel.exceptions import (
    SSHTunnelDatabasePortError,
    SSHTunnelingNotEnabledError,
)
from zobi.commands.database.utils import ping
from zobi.daos.database import DatabaseDAO
from zobi.databases.utils import make_url_safe
from zobi.errors import ErrorLevel, ZobiErrorType
from zobi.exceptions import (
    OAuth2RedirectError,
    ZobiErrorsException,
    ZobiSecurityException,
    ZobiTimeoutException,
)
from zobi.extensions import event_logger
from zobi.models.core import Database
from zobi.utils.ssh_tunnel import unmask_password_info

logger = logging.getLogger(__name__)


def get_log_connection_action(
    action: str, ssh_tunnel: Optional[Any], exc: Optional[Exception] = None
) -> str:
    action_modified = action
    if exc:
        action_modified += f".{exc.__class__.__name__}"
    if ssh_tunnel:
        action_modified += ".ssh_tunnel"
    return action_modified


class TestConnectionDatabaseCommand(BaseCommand):
    __test__ = False
    _model: Optional[Database] = None
    _context: dict[str, Any]
    _uri: str

    def __init__(self, data: dict[str, Any]):
        self._properties = data.copy()

        if (database_name := self._properties.get("database_name")) is not None:
            self._model = DatabaseDAO.get_database_by_name(database_name)

        uri = self._properties.get("sqlalchemy_uri", "")
        if self._model and uri == self._model.safe_sqlalchemy_uri():
            uri = self._model.sqlalchemy_uri_decrypted

        url = make_url_safe(uri)

        context = {
            "hostname": url.host,
            "password": url.password,
            "port": url.port,
            "username": url.username,
            "database": url.database,
        }

        self._context = context
        self._uri = uri

    def run(  # noqa: C901
        self,
    ) -> None:  # pylint: disable=too-many-statements,too-many-branches
        self.validate()
        ex_str = ""

        url = make_url_safe(self._uri)
        engine_name = url.get_backend_name()

        serialized_encrypted_extra = self._properties.get(
            "masked_encrypted_extra",
            "{}",
        )
        if self._model:
            serialized_encrypted_extra = (
                self._model.db_engine_spec.unmask_encrypted_extra(
                    self._model.encrypted_extra,
                    serialized_encrypted_extra,
                )
            )

        # collect SSH tunnel info
        ssh_tunnel_properties = self._properties.get("ssh_tunnel")
        if ssh_tunnel_properties and self._model and self._model.ssh_tunnel:
            # unmask password while allowing for updated values
            ssh_tunnel_properties = unmask_password_info(
                ssh_tunnel_properties,
                self._model.ssh_tunnel,
            )

        database: Database | None = None
        try:
            database = DatabaseDAO.build_db_for_connection_test(
                server_cert=self._properties.get("server_cert", ""),
                extra=self._properties.get("extra", "{}"),
                impersonate_user=self._properties.get("impersonate_user", False),
                encrypted_extra=serialized_encrypted_extra,
                ssh_tunnel=ssh_tunnel_properties,
            )

            database.set_sqlalchemy_uri(self._uri)
            database.db_engine_spec.mutate_db_for_connection_test(database)

            event_logger.log_with_context(
                action=get_log_connection_action(
                    "test_connection_attempt",
                    ssh_tunnel_properties,
                ),
                engine=engine_name,
            )

            with database.get_sqla_engine() as engine:
                try:
                    alive = ping(engine)
                except ZobiTimeoutException as ex:
                    raise ZobiTimeoutException(
                        error_type=ZobiErrorType.CONNECTION_DATABASE_TIMEOUT,
                        message=(
                            "Please check your connection details and database settings, "  # noqa: E501
                            "and ensure that your database is accepting connections, "
                            "then try connecting again."
                        ),
                        level=ErrorLevel.ERROR,
                        extra={"sqlalchemy_uri": database.sqlalchemy_uri},
                    ) from ex
                except Exception as ex:  # pylint: disable=broad-except
                    # If the connection failed because OAuth2 is needed, start the flow.
                    if (
                        database.is_oauth2_enabled()
                        and database.db_engine_spec.needs_oauth2(ex)
                    ):
                        database.start_oauth2_dance()

                    alive = False
                    # So we stop losing the original message if any
                    ex_str = str(ex)

            if not alive:
                raise DBAPIError(ex_str or None, None, None)

            # Log successful connection test with engine
            event_logger.log_with_context(
                action=get_log_connection_action(
                    "test_connection_success",
                    ssh_tunnel_properties,
                ),
                engine=engine_name,
            )

        except (NoSuchModuleError, ModuleNotFoundError) as ex:
            event_logger.log_with_context(
                action=get_log_connection_action(
                    "test_connection_error",
                    ssh_tunnel_properties,
                    ex,
                ),
                engine=engine_name,
            )
            raise DatabaseTestConnectionDriverError(
                message=_(
                    "Could not load database driver for: %(engine)s",
                    engine=engine_name,
                ),
            ) from ex
        except DBAPIError as ex:
            event_logger.log_with_context(
                action=get_log_connection_action(
                    "test_connection_error",
                    ssh_tunnel_properties,
                    ex,
                ),
                engine=engine_name,
            )

            if not database:
                raise
            # check for custom errors (wrong username, wrong password, etc)
            errors = database.db_engine_spec.extract_errors(
                ex, self._context, database_name=database.unique_name
            )
            raise ZobiErrorsException(errors, status=400) from ex
        except OAuth2RedirectError:
            raise
        except ZobiSecurityException as ex:
            event_logger.log_with_context(
                action=get_log_connection_action(
                    "test_connection_error",
                    ssh_tunnel_properties,
                    ex,
                ),
                engine=engine_name,
            )
            raise DatabaseSecurityUnsafeError(message=str(ex)) from ex
        except (ZobiTimeoutException, SSHTunnelingNotEnabledError) as ex:
            event_logger.log_with_context(
                action=get_log_connection_action(
                    "test_connection_error",
                    ssh_tunnel_properties,
                    ex,
                ),
                engine=engine_name,
            )
            # bubble up the exception to return proper status code
            raise
        except Exception as ex:
            if not database:
                raise

            if database.is_oauth2_enabled() and database.db_engine_spec.needs_oauth2(
                ex
            ):
                database.start_oauth2_dance()
            event_logger.log_with_context(
                action=get_log_connection_action(
                    "test_connection_error",
                    ssh_tunnel_properties,
                    ex,
                ),
                engine=engine_name,
            )
            errors = database.db_engine_spec.extract_errors(ex, self._context)
            raise DatabaseTestConnectionUnexpectedError(errors) from ex

    def validate(self) -> None:
        if self._properties.get("ssh_tunnel"):
            if not is_feature_enabled("SSH_TUNNELING"):
                raise SSHTunnelingNotEnabledError()
            if not self._context.get("port"):
                raise SSHTunnelDatabasePortError()
