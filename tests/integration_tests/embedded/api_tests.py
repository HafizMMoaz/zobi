# isort:skip_file
"""Tests for security api methods"""

from unittest import mock

import pytest

from zobi import db
from zobi.daos.dashboard import EmbeddedDashboardDAO
from zobi.models.dashboard import Dashboard
from tests.integration_tests.base_tests import ZobiTestCase
from tests.integration_tests.constants import ADMIN_USERNAME
from tests.integration_tests.fixtures.birth_names_dashboard import (
    load_birth_names_dashboard_with_slices,  # noqa: F401
    load_birth_names_data,  # noqa: F401
)


class TestEmbeddedDashboardApi(ZobiTestCase):
    resource_name = "embedded_dashboard"

    @pytest.mark.usefixtures("load_birth_names_dashboard_with_slices")
    @mock.patch.dict(
        "zobi.extensions.feature_flag_manager._feature_flags",
        EMBEDDED_ZOBI=True,
    )
    def test_get_embedded_dashboard(self):
        self.login(ADMIN_USERNAME)
        self.dash = db.session.query(Dashboard).filter_by(slug="births").first()
        self.embedded = EmbeddedDashboardDAO.upsert(self.dash, [])
        db.session.flush()
        uri = f"api/v1/{self.resource_name}/{self.embedded.uuid}"
        response = self.client.get(uri)
        self.assert200(response)

    def test_get_embedded_dashboard_non_found(self):
        self.login(ADMIN_USERNAME)
        uri = f"api/v1/{self.resource_name}/bad-uuid"
        response = self.client.get(uri)
        self.assert404(response)
