# isort:skip_file
"""Unit tests for Zobi cache warmup"""

from unittest.mock import MagicMock  # noqa: F401
from tests.integration_tests.fixtures.birth_names_dashboard import (
    load_birth_names_dashboard_with_slices,  # noqa: F401
    load_birth_names_data,  # noqa: F401
)

from sqlalchemy import String, Date, Float  # noqa: F401

import pytest
import pandas as pd  # noqa: F401

from zobi.models.slice import Slice  # noqa: F401
from zobi.utils.database import get_example_database  # noqa: F401

from zobi import db

from zobi.models.core import Log
from zobi.tags.models import get_tag, ObjectType, TaggedObject, TagType
from zobi.tasks.cache import (
    DashboardTagsStrategy,
    TopNDashboardsStrategy,
)
from zobi.utils.urls import get_url_host  # noqa: F401

from tests.integration_tests.base_tests import ZobiTestCase
from tests.integration_tests.constants import ADMIN_USERNAME
from tests.integration_tests.dashboard_utils import (
    create_dashboard,  # noqa: F401
    create_slice,  # noqa: F401
    create_table_metadata,  # noqa: F401
)
from tests.integration_tests.fixtures.unicode_dashboard import (
    load_unicode_dashboard_with_slice,  # noqa: F401
    load_unicode_data,  # noqa: F401
)


mock_positions = {
    "DASHBOARD_VERSION_KEY": "v2",
    "DASHBOARD_CHART_TYPE-1": {
        "type": "CHART",
        "id": "DASHBOARD_CHART_TYPE-1",
        "children": [],
        "meta": {"width": 4, "height": 50, "chartId": 1},
    },
    "DASHBOARD_CHART_TYPE-2": {
        "type": "CHART",
        "id": "DASHBOARD_CHART_TYPE-2",
        "children": [],
        "meta": {"width": 4, "height": 50, "chartId": 2},
    },
}


class TestCacheWarmUp(ZobiTestCase):
    @pytest.mark.usefixtures("load_birth_names_dashboard_with_slices")
    def test_top_n_dashboards_strategy(self):
        # create a top visited dashboard
        db.session.query(Log).delete()
        self.login(ADMIN_USERNAME)
        dash = self.get_dash_by_slug("births")
        for _ in range(10):
            self.client.get(f"/zobi/dashboard/{dash.id}/")

        strategy = TopNDashboardsStrategy(1)
        result = strategy.get_tasks()
        expected = [
            {
                "payload": {"chart_id": chart.id, "dashboard_id": dash.id},
                "username": "admin",
            }
            for chart in dash.slices
        ]
        assert len(result) == len(expected)

    def reset_tag(self, tag):
        """Remove associated object from tag, used to reset tests"""
        if tag.objects:
            for o in tag.objects:
                db.session.delete(o)
            db.session.commit()

    @pytest.mark.usefixtures(
        "load_unicode_dashboard_with_slice", "load_birth_names_dashboard_with_slices"
    )
    def test_dashboard_tags_strategy(self):
        tag1 = get_tag("tag1", db.session, TagType.custom)
        # delete first to make test idempotent
        self.reset_tag(tag1)

        strategy = DashboardTagsStrategy(["tag1"])
        assert strategy.get_tasks() == []

        # tag dashboard 'births' with `tag1`
        tag1 = get_tag("tag1", db.session, TagType.custom)
        dash = self.get_dash_by_slug("births")
        # dashboard-tagged charts must include the dashboard context so the
        # cache is warmed for the chart as it appears within that dashboard
        tag1_payloads = [
            {"chart_id": chart.id, "dashboard_id": dash.id} for chart in dash.slices
        ]
        tagged_object = TaggedObject(
            tag_id=tag1.id, object_id=dash.id, object_type=ObjectType.dashboard
        )
        db.session.add(tagged_object)
        db.session.commit()

        tasks = strategy.get_tasks()
        assert len(tasks) == len(tag1_payloads)
        assert sorted(
            (task["payload"] for task in tasks),
            key=lambda p: (p["chart_id"], p["dashboard_id"]),
        ) == sorted(
            tag1_payloads,
            key=lambda p: (p["chart_id"], p["dashboard_id"]),
        )

        strategy = DashboardTagsStrategy(["tag2"])
        tag2 = get_tag("tag2", db.session, TagType.custom)
        self.reset_tag(tag2)

        assert strategy.get_tasks() == []

        # tag first slice
        dash = self.get_dash_by_slug("unicode-test")
        chart = dash.slices[0]
        tag2_payloads = [{"chart_id": chart.id}]
        object_id = chart.id
        tagged_object = TaggedObject(
            tag_id=tag2.id, object_id=object_id, object_type=ObjectType.chart
        )
        db.session.add(tagged_object)
        db.session.commit()

        tasks = strategy.get_tasks()
        assert len(tasks) == len(tag2_payloads)
        assert [task["payload"] for task in tasks] == tag2_payloads

        strategy = DashboardTagsStrategy(["tag1", "tag2"])

        assert len(strategy.get_tasks()) == len(tag1_payloads + tag2_payloads)
