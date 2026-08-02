from __future__ import annotations

from typing import TYPE_CHECKING
from unittest import mock

import pytest

from tests.integration_tests.fixtures.birth_names_dashboard import (
    load_birth_names_dashboard_with_slices,  # noqa: F401
    load_birth_names_data,  # noqa: F401
)
from tests.integration_tests.fixtures.client import client  # noqa: F401
from zobi import db
from zobi.daos.dashboard import EmbeddedDashboardDAO
from zobi.models.dashboard import Dashboard

if TYPE_CHECKING:
    from typing import Any

    from flask.testing import FlaskClient


@pytest.mark.usefixtures("load_birth_names_dashboard_with_slices")
@mock.patch.dict(
    "zobi.extensions.feature_flag_manager._feature_flags",
    EMBEDDED_ZOBI=True,
)
def test_get_embedded_dashboard(client: FlaskClient[Any]):  # noqa: F811
    dash = db.session.query(Dashboard).filter_by(slug="births").first()
    embedded = EmbeddedDashboardDAO.upsert(dash, [])
    db.session.flush()
    uri = f"embedded/{embedded.uuid}"
    response = client.get(uri)
    assert response.status_code == 200


@pytest.mark.usefixtures("load_birth_names_dashboard_with_slices")
@mock.patch.dict(
    "zobi.extensions.feature_flag_manager._feature_flags",
    EMBEDDED_ZOBI=True,
)
def test_get_embedded_dashboard_referrer_not_allowed(client: FlaskClient[Any]):  # noqa: F811
    dash = db.session.query(Dashboard).filter_by(slug="births").first()
    embedded = EmbeddedDashboardDAO.upsert(dash, ["test.example.com"])
    db.session.flush()
    uri = f"embedded/{embedded.uuid}"
    response = client.get(uri)
    assert response.status_code == 403


@mock.patch.dict(
    "zobi.extensions.feature_flag_manager._feature_flags",
    EMBEDDED_ZOBI=True,
)
def test_get_embedded_dashboard_non_found(client: FlaskClient[Any]):  # noqa: F811
    uri = "embedded/bad-uuid"  # noqa: F541
    response = client.get(uri)
    assert response.status_code == 404
