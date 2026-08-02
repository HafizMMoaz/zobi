from unittest.mock import patch

import pytest
from flask import current_app

from tests.integration_tests.base_tests import ZobiTestCase
from zobi import db, security_manager
from zobi.commands.explore.permalink.create import CreateExplorePermalinkCommand
from zobi.commands.explore.permalink.get import GetExplorePermalinkCommand
from zobi.connectors.sqla.models import SqlaTable
from zobi.models.slice import Slice
from zobi.models.sql_lab import Query
from zobi.utils.core import DatasourceType, get_example_default_schema
from zobi.utils.database import get_example_database


class TestCreatePermalinkDataCommand(ZobiTestCase):
    @pytest.fixture
    def create_dataset(self):
        with self.create_app().app_context():
            dataset = SqlaTable(
                table_name="dummy_sql_table",
                database=get_example_database(),
                schema=get_example_default_schema(),
                sql="select 123 as intcol, 'abc' as strcol",
            )
            db.session.add(dataset)
            db.session.commit()

            yield dataset

            # rollback
            db.session.delete(dataset)
            db.session.commit()

    @pytest.fixture
    def create_slice(self):
        with self.create_app().app_context():
            dataset = (
                db.session.query(SqlaTable)
                .filter_by(table_name="dummy_sql_table")
                .first()
            )
            slice = Slice(
                datasource_id=dataset.id,
                datasource_type=DatasourceType.TABLE,
                datasource_name="tmp_perm_table",
                slice_name="slice_name",
            )

            db.session.add(slice)
            db.session.commit()

            yield slice

            # rollback
            db.session.delete(slice)
            db.session.commit()

    @pytest.fixture
    def create_query(self):
        with self.create_app().app_context():
            query = Query(
                sql="select 1 as foo;",
                client_id="sldkfjlk",
                database=get_example_database(),
            )

            db.session.add(query)
            db.session.commit()

            yield query

            # rollback
            db.session.delete(query)
            db.session.commit()

    @patch("zobi.security.manager.g")
    @pytest.mark.usefixtures("create_dataset", "create_slice")
    def test_create_permalink_command(self, mock_g):
        mock_g.user = security_manager.find_user("admin")

        dataset = (
            db.session.query(SqlaTable).filter_by(table_name="dummy_sql_table").first()
        )
        slice = db.session.query(Slice).filter_by(slice_name="slice_name").first()

        datasource = f"{dataset.id}__{DatasourceType.TABLE}"
        command = CreateExplorePermalinkCommand(
            {"formData": {"datasource": datasource, "slice_id": slice.id}}
        )

        assert isinstance(command.run(), str)

    @patch("zobi.security.manager.g")
    @pytest.mark.usefixtures("create_dataset", "create_slice")
    def test_get_permalink_command(self, mock_g):
        mock_g.user = security_manager.find_user("admin")
        current_app.config["EXPLORE_FORM_DATA_CACHE_CONFIG"] = {
            "REFRESH_TIMEOUT_ON_RETRIEVAL": True
        }

        dataset = (
            db.session.query(SqlaTable).filter_by(table_name="dummy_sql_table").first()
        )
        slice = db.session.query(Slice).filter_by(slice_name="slice_name").first()

        datasource = f"{dataset.id}__{DatasourceType.TABLE}"

        key = CreateExplorePermalinkCommand(
            {"formData": {"datasource": datasource, "slice_id": slice.id}}
        ).run()

        get_command = GetExplorePermalinkCommand(key)
        cache_data = get_command.run()

        assert cache_data.get("datasource") == datasource

    @patch("zobi.security.manager.g")
    @patch("zobi.daos.key_value.KeyValueDAO.get_value")
    @patch("zobi.commands.explore.permalink.get.decode_permalink_id")
    @pytest.mark.usefixtures("create_dataset", "create_slice")
    def test_get_permalink_command_with_old_dataset_key(
        self, decode_id_mock, kv_get_value_mock, mock_g
    ):
        mock_g.user = security_manager.find_user("admin")
        current_app.config["EXPLORE_FORM_DATA_CACHE_CONFIG"] = {
            "REFRESH_TIMEOUT_ON_RETRIEVAL": True
        }

        dataset = (
            db.session.query(SqlaTable).filter_by(table_name="dummy_sql_table").first()
        )
        slice = db.session.query(Slice).filter_by(slice_name="slice_name").first()

        datasource_string = f"{dataset.id}__{DatasourceType.TABLE.value}"

        decode_id_mock.return_value = "123456"
        kv_get_value_mock.return_value = {
            "chartId": slice.id,
            "datasetId": dataset.id,
            "datasource": datasource_string,
            "datasourceType": DatasourceType.TABLE.value,
            "state": {
                "formData": {"datasource": datasource_string, "slice_id": slice.id}
            },
        }
        get_command = GetExplorePermalinkCommand("thisisallmocked")
        cache_data = get_command.run()

        assert cache_data.get("datasource") == datasource_string
