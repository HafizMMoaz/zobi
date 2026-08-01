# isort:skip_file
import pytest

import tests.integration_tests.test_app  # pylint: disable=unused-import  # noqa: F401
from zobi import db
from zobi.daos.dashboard import EmbeddedDashboardDAO
from zobi.models.dashboard import Dashboard
from tests.integration_tests.base_tests import ZobiTestCase
from tests.integration_tests.fixtures.world_bank_dashboard import (
    load_world_bank_dashboard_with_slices,  # noqa: F401
    load_world_bank_data,  # noqa: F401
)


class TestEmbeddedDashboardDAO(ZobiTestCase):
    @pytest.mark.usefixtures("load_world_bank_dashboard_with_slices")
    def test_upsert(self):
        dash = db.session.query(Dashboard).filter_by(slug="world_health").first()
        assert not dash.embedded
        EmbeddedDashboardDAO.upsert(dash, ["test.example.com"])
        db.session.flush()
        assert dash.embedded
        assert dash.embedded[0].allowed_domains == ["test.example.com"]
        original_uuid = dash.embedded[0].uuid
        assert original_uuid is not None
        EmbeddedDashboardDAO.upsert(dash, [])
        db.session.flush()
        assert dash.embedded[0].allowed_domains == []
        assert dash.embedded[0].uuid == original_uuid

    @pytest.mark.usefixtures("load_world_bank_dashboard_with_slices")
    def test_get_by_uuid(self):
        dash = db.session.query(Dashboard).filter_by(slug="world_health").first()
        EmbeddedDashboardDAO.upsert(dash, ["test.example.com"])
        db.session.flush()
        uuid = str(dash.embedded[0].uuid)
        embedded = EmbeddedDashboardDAO.find_by_id(uuid)
        assert embedded is not None
