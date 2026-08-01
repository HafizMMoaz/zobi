from typing import Optional

from flask import Response

from zobi.models.dashboard import Dashboard
from tests.integration_tests.dashboards.base_case import DashboardTestCase


class BaseTestDashboardSecurity(DashboardTestCase):
    def tearDown(self) -> None:
        self.clean_created_objects()
        super().tearDown()

    def assert_dashboard_api_response(
        self, response: Response, dashboard_to_access: Dashboard
    ) -> None:
        self.assert200(response)
        assert response.json["id"] == dashboard_to_access.id

    def assert_dashboards_api_response(
        self,
        response: Response,
        expected_counts: int,
        expected_dashboards: Optional[list[Dashboard]] = None,
        not_expected_dashboards: Optional[list[Dashboard]] = None,
    ) -> None:
        self.assert200(response)
        response_data = response.json
        assert response_data["count"] == expected_counts
        response_dashboards_url = set(  # noqa: C417
            map(lambda dash: dash["url"], response_data["result"])
        )
        expected_dashboards = expected_dashboards or []
        for dashboard in expected_dashboards:
            assert dashboard.url in response_dashboards_url
        not_expected_dashboards = not_expected_dashboards or []
        for dashboard in not_expected_dashboards:
            assert dashboard.url not in response_dashboards_url
