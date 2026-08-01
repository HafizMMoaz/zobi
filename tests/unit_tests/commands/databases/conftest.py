
from unittest.mock import MagicMock

import pytest
from pytest_mock import MockerFixture

from zobi.db_engine_specs.base import BaseEngineSpec
from zobi.exceptions import OAuth2RedirectError
from zobi.utils import json

oauth2_client_info = {
    "id": "client_id",
    "secret": "client_secret",
    "scope": "scope-a",
    "redirect_uri": "redirect_uri",
    "authorization_request_uri": "auth_uri",
    "token_request_uri": "token_uri",
    "request_content_type": "json",
}


@pytest.fixture
def database_with_catalog(mocker: MockerFixture) -> MagicMock:
    """
    Mock a database with catalogs and schemas.
    """
    database = mocker.MagicMock()
    database.database_name = "my_db"
    database.db_engine_spec.__name__ = "test_engine"
    database.db_engine_spec.supports_catalog = True
    database.get_all_catalog_names.return_value = ["catalog1", "catalog2"]
    database.get_all_schema_names.side_effect = [
        ["schema1", "schema2"],
        ["schema3", "schema4"],
    ]
    database.get_default_catalog.return_value = "catalog2"

    return database


@pytest.fixture
def database_without_catalog(mocker: MockerFixture) -> MagicMock:
    """
    Mock a database without catalogs.
    """
    database = mocker.MagicMock()
    database.database_name = "my_db"
    database.db_engine_spec.__name__ = "test_engine"
    database.db_engine_spec.supports_catalog = False
    database.get_all_schema_names.return_value = ["schema1", "schema2"]
    database.is_oauth2_enabled.return_value = False
    database.db_engine_spec.needs_oauth2.return_value = False

    return database


@pytest.fixture
def database_needs_oauth2(mocker: MockerFixture) -> MagicMock:
    """
    Mock a database without catalogs that needs OAuth2.
    """
    database = mocker.MagicMock()
    database.database_name = "my_db"
    database.db_engine_spec.__name__ = "test_engine"
    database.db_engine_spec.supports_catalog = False
    database.get_all_schema_names.side_effect = OAuth2RedirectError(
        "url",
        "tab_id",
        "redirect_uri",
    )
    database.encrypted_extra = json.dumps({"oauth2_client_info": oauth2_client_info})
    database.db_engine_spec.unmask_encrypted_extra = (
        BaseEngineSpec.unmask_encrypted_extra
    )

    return database
