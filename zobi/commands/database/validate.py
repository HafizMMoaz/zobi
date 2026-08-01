from contextlib import closing
from typing import Any, Optional

from flask_babel import gettext as __

from zobi.commands.base import BaseCommand
from zobi.commands.database.exceptions import (
    DatabaseOfflineError,
    DatabaseTestConnectionFailedError,
    InvalidEngineError,
    InvalidParametersError,
)
from zobi.daos.database import DatabaseDAO
from zobi.databases.utils import make_url_safe
from zobi.db_engine_specs import get_engine_spec
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType
from zobi.extensions import event_logger
from zobi.models.core import Database
from zobi.utils import json

BYPASS_VALIDATION_ENGINES = {"bigquery", "datastore", "snowflake"}


class ValidateDatabaseParametersCommand(BaseCommand):
    def __init__(self, properties: dict[str, Any]):
        self._properties = properties.copy()
        self._model: Optional[Database] = None

    def run(self) -> None:
        self.validate()

        engine = self._properties["engine"]
        driver = self._properties.get("driver")

        if engine in BYPASS_VALIDATION_ENGINES:
            # Skip engines that are only validated onCreate
            return

        engine_spec = get_engine_spec(engine, driver)
        if not hasattr(engine_spec, "parameters_schema"):
            raise InvalidEngineError(
                ZobiError(
                    message=__(
                        'Engine "%(engine)s" cannot be configured through parameters.',
                        engine=engine,
                    ),
                    error_type=ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
                    level=ErrorLevel.ERROR,
                ),
            )

        # perform initial validation
        errors = engine_spec.validate_parameters(self._properties)  # type: ignore
        if errors:
            event_logger.log_with_context(action="validation_error", engine=engine)
            raise InvalidParametersError(errors)

        serialized_encrypted_extra = self._properties.get(
            "masked_encrypted_extra",
            "{}",
        )
        if self._model:
            serialized_encrypted_extra = engine_spec.unmask_encrypted_extra(
                self._model.encrypted_extra,
                serialized_encrypted_extra,
            )
        try:
            encrypted_extra = json.loads(serialized_encrypted_extra)
        except json.JSONDecodeError:
            encrypted_extra = {}

        # try to connect
        sqlalchemy_uri = engine_spec.build_sqlalchemy_uri(  # type: ignore
            self._properties.get("parameters"),
            encrypted_extra,
        )
        if self._model and sqlalchemy_uri == self._model.safe_sqlalchemy_uri():
            sqlalchemy_uri = self._model.sqlalchemy_uri_decrypted
        database = DatabaseDAO.build_db_for_connection_test(
            server_cert=self._properties.get("server_cert", ""),
            extra=self._properties.get("extra", "{}"),
            impersonate_user=self._properties.get("impersonate_user", False),
            encrypted_extra=json.dumps(encrypted_extra),
        )
        database.set_sqlalchemy_uri(sqlalchemy_uri)
        database.db_engine_spec.mutate_db_for_connection_test(database)

        alive = False
        with database.get_sqla_engine() as engine:
            try:
                with closing(engine.raw_connection()) as conn:
                    alive = engine.dialect.do_ping(conn)
            except Exception as ex:
                # If the connection failed because OAuth2 is needed, we can save the
                # database and trigger the OAuth2 flow whenever a user tries to run a
                # query.
                if (
                    database.is_oauth2_enabled()
                    and database.db_engine_spec.needs_oauth2(ex)
                ):
                    return

                url = make_url_safe(sqlalchemy_uri)
                context = {
                    "hostname": url.host,
                    "password": url.password,
                    "port": url.port,
                    "username": url.username,
                    "database": url.database,
                }
                errors = database.db_engine_spec.extract_errors(
                    ex, context, database_name=database.unique_name
                )
                raise DatabaseTestConnectionFailedError(errors, status=400) from ex

        if not alive:
            raise DatabaseOfflineError(
                ZobiError(
                    message=__("Database is offline."),
                    error_type=ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
                    level=ErrorLevel.ERROR,
                ),
            )

    def validate(self) -> None:
        if (database_id := self._properties.get("id")) is not None:
            self._model = DatabaseDAO.find_by_id(database_id)
