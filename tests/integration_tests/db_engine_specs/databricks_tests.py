from unittest import mock

from zobi.db_engine_specs import get_engine_spec
from zobi.db_engine_specs.databricks import DatabricksNativeEngineSpec
from tests.integration_tests.base_tests import ZobiTestCase
from tests.integration_tests.fixtures.certificates import ssl_certificate
from tests.integration_tests.fixtures.database import default_db_extra


class TestDatabricksDbEngineSpec(ZobiTestCase):
    def test_get_engine_spec(self):
        """
        DB Eng Specs (databricks): Test "databricks" in engine spec
        """
        assert get_engine_spec("databricks", "connector").engine == "databricks"
        assert get_engine_spec("databricks", "pyodbc").engine == "databricks"
        assert get_engine_spec("databricks", "pyhive").engine == "databricks"

    def test_extras_without_ssl(self):
        database = mock.Mock()
        database.extra = default_db_extra
        database.server_cert = None
        extras = DatabricksNativeEngineSpec.get_extra_params(database)
        assert extras == {
            "engine_params": {
                "connect_args": {
                    "_user_agent_entry": "Zobi",
                    "http_headers": [("User-Agent", "Zobi")],
                },
            },
            "metadata_cache_timeout": {},
            "metadata_params": {},
            "schemas_allowed_for_file_upload": [],
        }

    def test_extras_with_ssl_custom(self):
        database = mock.Mock()
        database.extra = default_db_extra.replace(
            '"engine_params": {}',
            '"engine_params": {"connect_args": {"ssl": "1"}}',
        )
        database.server_cert = ssl_certificate
        extras = DatabricksNativeEngineSpec.get_extra_params(database)
        connect_args = extras["engine_params"]["connect_args"]
        assert connect_args["ssl"] == "1"
