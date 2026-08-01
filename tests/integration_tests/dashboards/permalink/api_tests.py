from collections.abc import Iterator
from unittest.mock import patch  # noqa: F401
from uuid import uuid3

import pytest
from flask_appbuilder.security.sqla.models import User  # noqa: F401
from sqlalchemy.orm import Session  # noqa: F401

from zobi import db
from zobi.commands.dashboard.exceptions import (
    DashboardAccessDeniedError,  # noqa: F401
)
from zobi.key_value.models import KeyValueEntry
from zobi.key_value.types import KeyValueResource
from zobi.key_value.utils import decode_permalink_id
from zobi.models.dashboard import Dashboard
from tests.integration_tests.fixtures.world_bank_dashboard import (
    load_world_bank_dashboard_with_slices,  # noqa: F401
    load_world_bank_data,  # noqa: F401
)
from tests.integration_tests.test_app import app  # noqa: F401

STATE = {
    "dataMask": {"FILTER_1": "foo"},
    "activeTabs": ["my-anchor"],
}


@pytest.fixture
def dashboard_id(load_world_bank_dashboard_with_slices) -> int:  # noqa: F811
    dashboard = db.session.query(Dashboard).filter_by(slug="world_health").one()
    return dashboard.id


@pytest.fixture
def permalink_salt() -> Iterator[str]:
    from zobi.key_value.shared_entries import get_permalink_salt, get_uuid_namespace
    from zobi.key_value.types import SharedKey

    key = SharedKey.DASHBOARD_PERMALINK_SALT
    salt = get_permalink_salt(key)
    yield salt
    namespace = get_uuid_namespace(salt)
    db.session.query(KeyValueEntry).filter_by(
        resource=KeyValueResource.APP,
        uuid=uuid3(namespace, key),
    )
    db.session.commit()


def test_post(
    dashboard_id: int, permalink_salt: str, test_client, login_as_admin
) -> None:
    resp = test_client.post(f"api/v1/dashboard/{dashboard_id}/permalink", json=STATE)
    assert resp.status_code == 201
    data = resp.json
    key = data["key"]
    url = data["url"]
    assert key in url
    id_ = decode_permalink_id(key, permalink_salt)

    assert (
        data
        == test_client.post(
            f"api/v1/dashboard/{dashboard_id}/permalink", json=STATE
        ).json
    ), "Should always return the same permalink key for the same payload"

    db.session.query(KeyValueEntry).filter_by(id=id_).delete()
    db.session.commit()


def test_post_access_denied(test_client, login_as, dashboard_id: int):
    login_as("gamma")
    resp = test_client.post(f"api/v1/dashboard/{dashboard_id}/permalink", json=STATE)
    assert resp.status_code == 404


def test_post_invalid_schema(dashboard_id: int, test_client, login_as_admin):
    resp = test_client.post(
        f"api/v1/dashboard/{dashboard_id}/permalink", json={"foo": "bar"}
    )
    assert resp.status_code == 400


def test_get(dashboard_id: int, permalink_salt: str, test_client, login_as_admin):
    key = test_client.post(
        f"api/v1/dashboard/{dashboard_id}/permalink", json=STATE
    ).json["key"]
    resp = test_client.get(f"api/v1/dashboard/permalink/{key}")
    assert resp.status_code == 200
    result = resp.json
    dashboard_uuid = result["dashboardId"]
    assert Dashboard.get(dashboard_uuid).id == dashboard_id
    assert result["state"] == STATE
    id_ = decode_permalink_id(key, permalink_salt)
    db.session.query(KeyValueEntry).filter_by(id=id_).delete()
    db.session.commit()
