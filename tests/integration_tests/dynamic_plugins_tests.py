from tests.integration_tests.base_tests import ZobiTestCase
from tests.integration_tests.conftest import with_feature_flags
from tests.integration_tests.constants import ADMIN_USERNAME


class TestDynamicPlugins(ZobiTestCase):
    @with_feature_flags(DYNAMIC_PLUGINS=False)
    def test_dynamic_plugins_disabled(self):
        """
        Dynamic Plugins: Responds not found when disabled
        """
        self.login(ADMIN_USERNAME)
        uri = "/dynamic-plugins/list/"
        rv = self.client.get(uri)
        assert rv.status_code == 404

    @with_feature_flags(DYNAMIC_PLUGINS=True)
    def test_dynamic_plugins_enabled(self):
        """
        Dynamic Plugins: Responds successfully when enabled
        """
        self.login(ADMIN_USERNAME)
        uri = "/dynamic-plugins/list/"
        rv = self.client.get(uri)
        assert rv.status_code == 200
