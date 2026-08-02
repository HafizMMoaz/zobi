from unittest.mock import patch

import pytest
from flask_appbuilder.security.sqla.models import User
from sqlalchemy.orm import Session  # noqa: F401

from tests.integration_tests.fixtures.world_bank_dashboard import (
    load_world_bank_dashboard_with_slices,  # noqa: F401
    load_world_bank_data,  # noqa: F401
)
from tests.integration_tests.test_app import app
from zobi import db
from zobi.commands.dataset.exceptions import DatasetAccessDeniedError
from zobi.commands.explore.form_data.state import TemporaryExploreState
from zobi.connectors.sqla.models import SqlaTable
from zobi.extensions import cache_manager
from zobi.models.slice import Slice
from zobi.utils import json
from zobi.utils.core import DatasourceType

KEY = "test-key"
INITIAL_FORM_DATA = json.dumps({"test": "initial value"})
UPDATED_FORM_DATA = json.dumps({"test": "updated value"})


@pytest.fixture
def chart_id(load_world_bank_dashboard_with_slices) -> int:  # noqa: F811
    with app.app_context() as ctx:  # noqa: F841
        chart = db.session.query(Slice).filter_by(slice_name="World's Population").one()
        return chart.id


@pytest.fixture
def admin_id() -> int:
    with app.app_context() as ctx:  # noqa: F841
        admin = db.session.query(User).filter_by(username="admin").one()
        return admin.id


@pytest.fixture
def datasource() -> int:
    with app.app_context() as ctx:  # noqa: F841
        dataset = (
            db.session.query(SqlaTable)
            .filter_by(table_name="wb_health_population")
            .first()
        )
        return dataset


@pytest.fixture(autouse=True)
def cache(chart_id, admin_id, datasource):
    entry: TemporaryExploreState = {
        "owner": admin_id,
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": INITIAL_FORM_DATA,
    }
    cache_manager.explore_form_data_cache.set(KEY, entry)


def test_post(test_client, login_as_admin, chart_id: int, datasource: SqlaTable):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": INITIAL_FORM_DATA,
    }
    resp = test_client.post("api/v1/explore/form_data", json=payload)
    assert resp.status_code == 201


def test_post_bad_request_non_string(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": 1234,
    }
    resp = test_client.post("api/v1/explore/form_data", json=payload)
    assert resp.status_code == 400


def test_post_bad_request_non_json_string(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": "foo",
    }
    resp = test_client.post("api/v1/explore/form_data", json=payload)
    assert resp.status_code == 400


def test_post_access_denied(
    test_client, login_as, chart_id: int, datasource: SqlaTable
):
    login_as("gamma")
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": INITIAL_FORM_DATA,
    }
    resp = test_client.post("api/v1/explore/form_data", json=payload)
    assert resp.status_code == 403


def test_post_same_key_for_same_context(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": UPDATED_FORM_DATA,
    }
    resp = test_client.post("api/v1/explore/form_data?tab_id=1", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    first_key = data.get("key")
    resp = test_client.post("api/v1/explore/form_data?tab_id=1", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    second_key = data.get("key")
    assert first_key == second_key


def test_post_different_key_for_different_context(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": UPDATED_FORM_DATA,
    }
    resp = test_client.post("api/v1/explore/form_data?tab_id=1", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    first_key = data.get("key")
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "form_data": json.dumps({"test": "initial value"}),
    }
    resp = test_client.post("api/v1/explore/form_data?tab_id=1", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    second_key = data.get("key")
    assert first_key != second_key


def test_post_same_key_for_same_tab_id(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": json.dumps({"test": "initial value"}),
    }
    resp = test_client.post("api/v1/explore/form_data?tab_id=1", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    first_key = data.get("key")
    resp = test_client.post("api/v1/explore/form_data?tab_id=1", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    second_key = data.get("key")
    assert first_key == second_key


def test_post_different_key_for_different_tab_id(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": json.dumps({"test": "initial value"}),
    }
    resp = test_client.post("api/v1/explore/form_data?tab_id=1", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    first_key = data.get("key")
    resp = test_client.post("api/v1/explore/form_data?tab_id=2", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    second_key = data.get("key")
    assert first_key != second_key


def test_post_different_key_for_no_tab_id(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": INITIAL_FORM_DATA,
    }
    resp = test_client.post("api/v1/explore/form_data", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    first_key = data.get("key")
    resp = test_client.post("api/v1/explore/form_data", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    second_key = data.get("key")
    assert first_key != second_key


def test_put(test_client, login_as_admin, chart_id: int, datasource: SqlaTable):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": UPDATED_FORM_DATA,
    }
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}", json=payload)
    assert resp.status_code == 200


def test_put_same_key_for_same_tab_id(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": UPDATED_FORM_DATA,
    }
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}?tab_id=1", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    first_key = data.get("key")
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}?tab_id=1", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    second_key = data.get("key")
    assert first_key == second_key


def test_put_different_key_for_different_tab_id(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": UPDATED_FORM_DATA,
    }
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}?tab_id=1", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    first_key = data.get("key")
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}?tab_id=2", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    second_key = data.get("key")
    assert first_key != second_key


def test_put_different_key_for_no_tab_id(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": UPDATED_FORM_DATA,
    }
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    first_key = data.get("key")
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}", json=payload)
    data = json.loads(resp.data.decode("utf-8"))
    second_key = data.get("key")
    assert first_key != second_key


def test_put_bad_request(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": 1234,
    }
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}", json=payload)
    assert resp.status_code == 400


def test_put_bad_request_non_string(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": 1234,
    }
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}", json=payload)
    assert resp.status_code == 400


def test_put_bad_request_non_json_string(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable
):
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": "foo",
    }
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}", json=payload)
    assert resp.status_code == 400


def test_put_access_denied(test_client, login_as, chart_id: int, datasource: SqlaTable):
    login_as("gamma")
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": UPDATED_FORM_DATA,
    }
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}", json=payload)
    assert resp.status_code == 403


def test_put_not_owner(test_client, login_as, chart_id: int, datasource: SqlaTable):
    login_as("gamma")
    payload = {
        "datasource_id": datasource.id,
        "datasource_type": datasource.type,
        "chart_id": chart_id,
        "form_data": UPDATED_FORM_DATA,
    }
    resp = test_client.put(f"api/v1/explore/form_data/{KEY}", json=payload)
    assert resp.status_code == 403


def test_get_key_not_found(test_client, login_as_admin):
    resp = test_client.get(f"api/v1/explore/form_data/unknown-key")  # noqa: F541
    assert resp.status_code == 404


def test_get(test_client, login_as_admin):
    resp = test_client.get(f"api/v1/explore/form_data/{KEY}")
    assert resp.status_code == 200
    data = json.loads(resp.data.decode("utf-8"))
    assert INITIAL_FORM_DATA == data.get("form_data")


def test_get_access_denied(test_client, login_as):
    login_as("gamma")
    resp = test_client.get(f"api/v1/explore/form_data/{KEY}")
    assert resp.status_code == 403


@patch("zobi.security.ZobiSecurityManager.can_access_datasource")
def test_get_dataset_access_denied(
    mock_can_access_datasource, test_client, login_as_admin
):
    mock_can_access_datasource.side_effect = DatasetAccessDeniedError()
    resp = test_client.get(f"api/v1/explore/form_data/{KEY}")
    assert resp.status_code == 403


def test_delete(test_client, login_as_admin):
    resp = test_client.delete(f"api/v1/explore/form_data/{KEY}")
    assert resp.status_code == 200


def test_delete_access_denied(test_client, login_as):
    login_as("gamma")
    resp = test_client.delete(f"api/v1/explore/form_data/{KEY}")
    assert resp.status_code == 403


def test_delete_not_owner(
    test_client, login_as_admin, chart_id: int, datasource: SqlaTable, admin_id: int
):
    another_key = "another_key"
    another_owner = admin_id + 1
    entry: TemporaryExploreState = {
        "owner": another_owner,
        "datasource_id": datasource.id,
        "datasource_type": DatasourceType(datasource.type),
        "chart_id": chart_id,
        "form_data": INITIAL_FORM_DATA,
    }
    cache_manager.explore_form_data_cache.set(another_key, entry)
    resp = test_client.delete(f"api/v1/explore/form_data/{another_key}")
    assert resp.status_code == 403
