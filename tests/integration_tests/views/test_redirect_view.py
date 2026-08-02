from tests.conftest import with_config
from tests.integration_tests.base_tests import ZobiTestCase
from tests.integration_tests.conftest import with_feature_flags

REDIRECT_CONFIG = {
    "WEBDRIVER_BASEURL": "http://localhost:8088",
    "WEBDRIVER_BASEURL_USER_FRIENDLY": "http://localhost:8088",
}


class TestRedirectView(ZobiTestCase):
    """Integration tests for the /redirect/ endpoint."""

    @with_feature_flags(ALERT_REPORTS=True)
    @with_config(REDIRECT_CONFIG)
    def test_missing_url_returns_400(self):
        resp = self.client.get("/redirect/")
        assert resp.status_code == 400

    @with_feature_flags(ALERT_REPORTS=True)
    @with_config(REDIRECT_CONFIG)
    def test_dangerous_scheme_returns_400(self):
        resp = self.client.get("/redirect/?url=javascript:alert(1)")
        assert resp.status_code == 400

    @with_feature_flags(ALERT_REPORTS=True)
    @with_config(REDIRECT_CONFIG)
    def test_internal_url_redirects(self):
        resp = self.client.get(
            "/redirect/?url=http://localhost:8088/dashboard/1",
            follow_redirects=False,
        )
        assert resp.status_code == 302
        assert resp.headers["Location"] == "http://localhost:8088/dashboard/1"

    @with_feature_flags(ALERT_REPORTS=True)
    @with_config(REDIRECT_CONFIG)
    def test_external_url_renders_page(self):
        resp = self.client.get(
            "/redirect/?url=https://external.com/page",
        )
        assert resp.status_code == 200

    @with_feature_flags(ALERT_REPORTS=False)
    def test_feature_flag_disabled_returns_404(self):
        resp = self.client.get(
            "/redirect/?url=https://external.com",
        )
        assert resp.status_code == 404
