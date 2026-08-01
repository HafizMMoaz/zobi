from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from flask import current_app as app
from sqlalchemy.sql import compiler

from zobi.constants import EXAMPLES_DB_UUID

if TYPE_CHECKING:
    from zobi.connectors.sqla.models import Database

logging.getLogger("MARKDOWN").setLevel(logging.INFO)
logger = logging.getLogger(__name__)


# TODO: duplicate code with DatabaseDao, below function should be moved or use dao
def get_or_create_db(
    database_name: str, sqlalchemy_uri: str, always_create: bool | None = True
) -> Database:
    # pylint: disable=import-outside-toplevel
    from zobi import db
    from zobi.models import core as models

    database = (
        db.session.query(models.Database).filter_by(database_name=database_name).first()
    )

    # databases with a fixed UUID
    uuids = {
        "examples": EXAMPLES_DB_UUID,
    }

    if not database and always_create:
        logger.info("Creating database reference for %s", database_name)
        database = models.Database(
            database_name=database_name, uuid=uuids.get(database_name)
        )
        db.session.add(database)
        database.set_sqlalchemy_uri(sqlalchemy_uri)

    # todo: it's a bad idea to do an update in a get/create function
    if database and database.sqlalchemy_uri_decrypted != sqlalchemy_uri:
        database.set_sqlalchemy_uri(sqlalchemy_uri)

    db.session.flush()
    return database


def get_example_database() -> Database:
    # pylint: disable=import-outside-toplevel

    return get_or_create_db("examples", app.config["SQLALCHEMY_EXAMPLES_URI"])


def get_main_database() -> Database:
    # pylint: disable=import-outside-toplevel

    db_uri = app.config["SQLALCHEMY_DATABASE_URI"]
    return get_or_create_db("main", db_uri)


# TODO - the below method used by tests so should move there but should move together
# with above function... think of how to refactor it
def remove_database(database: Database) -> None:
    # pylint: disable=import-outside-toplevel
    from zobi import db

    db.session.delete(database)
    db.session.flush()


def apply_mariadb_ddl_fix() -> None:
    """
    Fix MariaDB "NO CYCLE" syntax issue - MariaDB uses "NOCYCLE" (no space).

    This fix will be included in SQLAlchemy v2.1.0.
    See: https://github.com/sqlalchemy/sqlalchemy/blob/rel_2_1_0b1/lib/sqlalchemy/dialects/mysql/_mariadb_shim.py
    """
    original_visit_create_sequence = compiler.DDLCompiler.visit_create_sequence

    def patched_visit_create_sequence(self: Any, create: Any, **kw: Any) -> str:
        text = original_visit_create_sequence(self, create, **kw)
        dialect_name = getattr(self.dialect, "name", "") or ""
        if "mariadb" in dialect_name.lower():
            return text.replace("NO CYCLE", "NOCYCLE")
        return text

    compiler.DDLCompiler.visit_create_sequence = patched_visit_create_sequence
