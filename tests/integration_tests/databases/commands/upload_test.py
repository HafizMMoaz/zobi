from __future__ import annotations

import pytest
from flask.ctx import AppContext

from tests.integration_tests.conftest import only_postgresql
from tests.integration_tests.test_app import app
from tests.unit_tests.fixtures.common import create_csv_file
from zobi import db, security_manager
from zobi.commands.database.exceptions import (
    DatabaseNotFoundError,
    DatabaseSchemaUploadNotAllowed,
    DatabaseUploadNotSupported,
)
from zobi.commands.database.uploaders.base import UploadCommand
from zobi.commands.database.uploaders.csv_reader import CSVReader
from zobi.connectors.sqla.models import SqlaTable
from zobi.models.core import Database
from zobi.utils import json
from zobi.utils.core import override_user
from zobi.utils.database import get_or_create_db

CSV_UPLOAD_DATABASE = "csv_explore_db"
CSV_UPLOAD_TABLE = "csv_upload"
CSV_UPLOAD_TABLE_W_SCHEMA = "csv_upload_w_schema"


CSV_FILE_1 = [
    ["Name", "Age", "City", "Birth"],
    ["name1", "30", "city1", "1-1-1980"],
    ["name2", "29", "city2", "1-1-1981"],
    ["name3", "28", "city3", "1-1-1982"],
]

CSV_FILE_WITH_NULLS = [
    ["Name", "Age", "City", "Birth"],
    ["name1", "N/A", "city1", "1-1-1980"],
    ["name2", "29", "None", "1-1-1981"],
    ["name3", "28", "city3", "1-1-1982"],
]


def _setup_csv_upload(allowed_schemas: list[str] | None = None):
    # Use main database URI for schema-related tests (PostgreSQL-specific)
    # Use examples URI for general upload tests
    if allowed_schemas:
        db_uri = app.config["SQLALCHEMY_DATABASE_URI"]
    else:
        db_uri = app.config["SQLALCHEMY_EXAMPLES_URI"]

    upload_db = get_or_create_db(CSV_UPLOAD_DATABASE, db_uri)
    upload_db.allow_file_upload = True
    extra = upload_db.get_extra()
    allowed_schemas = allowed_schemas or []
    extra["schemas_allowed_for_file_upload"] = allowed_schemas
    upload_db.extra = json.dumps(extra)

    db.session.commit()

    yield

    upload_db = get_upload_db()
    with upload_db.get_sqla_engine() as engine:
        engine.execute(f"DROP TABLE IF EXISTS {CSV_UPLOAD_TABLE}")
        engine.execute(f"DROP TABLE IF EXISTS {CSV_UPLOAD_TABLE_W_SCHEMA}")
    db.session.delete(upload_db)
    db.session.commit()


def get_upload_db():
    return db.session.query(Database).filter_by(database_name=CSV_UPLOAD_DATABASE).one()


@pytest.fixture
def setup_csv_upload_with_context(app_context: AppContext):
    yield from _setup_csv_upload()


@pytest.fixture
def setup_csv_upload_with_context_schema(app_context: AppContext):
    yield from _setup_csv_upload(["public"])


@pytest.mark.usefixtures("setup_csv_upload_with_context")
def test_csv_upload_with_nulls():
    admin_user = security_manager.find_user(username="admin")
    upload_database = get_upload_db()

    with override_user(admin_user):
        UploadCommand(
            upload_database.id,
            CSV_UPLOAD_TABLE,
            create_csv_file(CSV_FILE_WITH_NULLS),
            None,
            CSVReader({"null_values": ["N/A", "None"]}),
        ).run()
    with upload_database.get_sqla_engine() as engine:
        data = engine.execute(f"SELECT * from {CSV_UPLOAD_TABLE}").fetchall()  # noqa: S608
        assert data == [
            ("name1", None, "city1", "1-1-1980"),
            ("name2", 29, None, "1-1-1981"),
            ("name3", 28, "city3", "1-1-1982"),
        ]


@pytest.mark.usefixtures("setup_csv_upload_with_context")
def test_csv_upload_dataset():
    admin_user = security_manager.find_user(username="admin")
    upload_database = get_upload_db()

    with override_user(admin_user):
        UploadCommand(
            upload_database.id,
            CSV_UPLOAD_TABLE,
            create_csv_file(),
            None,
            CSVReader({}),
        ).run()
    dataset = (
        db.session.query(SqlaTable)
        .filter_by(database_id=upload_database.id, table_name=CSV_UPLOAD_TABLE)
        .one_or_none()
    )
    assert dataset is not None
    assert security_manager.find_user("admin") in dataset.owners


@pytest.mark.usefixtures("setup_csv_upload_with_context")
def test_csv_upload_with_index():
    admin_user = security_manager.find_user(username="admin")
    upload_database = get_upload_db()

    with override_user(admin_user):
        UploadCommand(
            upload_database.id,
            CSV_UPLOAD_TABLE,
            create_csv_file(CSV_FILE_1),
            None,
            CSVReader({"dataframe_index": True, "index_label": "id"}),
        ).run()
    with upload_database.get_sqla_engine() as engine:
        data = engine.execute(f"SELECT * from {CSV_UPLOAD_TABLE}").fetchall()  # noqa: S608
        assert data == [
            (0, "name1", 30, "city1", "1-1-1980"),
            (1, "name2", 29, "city2", "1-1-1981"),
            (2, "name3", 28, "city3", "1-1-1982"),
        ]
        # assert column names
        assert [  # noqa: C416
            col
            for col in engine.execute(f"SELECT * from {CSV_UPLOAD_TABLE}").keys()  # noqa: S608
        ] == [
            "id",
            "Name",
            "Age",
            "City",
            "Birth",
        ]


@only_postgresql
@pytest.mark.usefixtures("setup_csv_upload_with_context")
def test_csv_upload_database_not_found():
    admin_user = security_manager.find_user(username="admin")

    with override_user(admin_user):
        with pytest.raises(DatabaseNotFoundError):
            UploadCommand(
                1000,
                CSV_UPLOAD_TABLE,
                create_csv_file(CSV_FILE_1),
                None,
                CSVReader({}),
            ).run()


@only_postgresql
@pytest.mark.usefixtures("setup_csv_upload_with_context")
def test_csv_upload_database_not_supported():
    admin_user = security_manager.find_user(username="admin")
    upload_db: Database = get_upload_db()
    upload_db.db_engine_spec.supports_file_upload = False
    with override_user(admin_user):
        with pytest.raises(DatabaseUploadNotSupported):
            UploadCommand(
                upload_db.id,
                CSV_UPLOAD_TABLE,
                create_csv_file(CSV_FILE_1),
                None,
                CSVReader({}),
            ).run()
    upload_db.db_engine_spec.supports_file_upload = True


@only_postgresql
@pytest.mark.usefixtures("setup_csv_upload_with_context_schema")
def test_csv_upload_schema_not_allowed():
    admin_user = security_manager.find_user(username="admin")
    upload_db_id = get_upload_db().id
    with override_user(admin_user):
        with pytest.raises(DatabaseSchemaUploadNotAllowed):
            UploadCommand(
                upload_db_id,
                CSV_UPLOAD_TABLE,
                create_csv_file(CSV_FILE_1),
                None,
                CSVReader({}),
            ).run()
        with pytest.raises(DatabaseSchemaUploadNotAllowed):
            UploadCommand(
                upload_db_id,
                CSV_UPLOAD_TABLE,
                create_csv_file(CSV_FILE_1),
                "schema1",
                CSVReader({}),
            ).run()
        UploadCommand(
            upload_db_id,
            CSV_UPLOAD_TABLE_W_SCHEMA,
            create_csv_file(CSV_FILE_1),
            "public",
            CSVReader({}),
        ).run()
