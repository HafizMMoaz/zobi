import pytest  # noqa: F401

from tests.integration_tests.base_tests import ZobiTestCase
from zobi.extensions import cache_manager
from zobi.utils.core import backend, DatasourceType  # noqa: F401


class UtilsCacheManagerTests(ZobiTestCase):
    def test_get_set_explore_form_data_cache(self):
        key = "12345"
        data = {"foo": "bar", "datasource_type": "query"}
        cache_manager.explore_form_data_cache.set(key, data)
        assert cache_manager.explore_form_data_cache.get(key) == data

    def test_get_same_context_twice(self):
        key = "12345"
        data = {"foo": "bar", "datasource_type": "query"}
        cache_manager.explore_form_data_cache.set(key, data)
        assert cache_manager.explore_form_data_cache.get(key) == data
        assert cache_manager.explore_form_data_cache.get(key) == data

    def test_get_set_explore_form_data_cache_no_datasource_type(self):
        key = "12345"
        data = {"foo": "bar"}
        cache_manager.explore_form_data_cache.set(key, data)
        # datasource_type should be added because it is not present
        assert cache_manager.explore_form_data_cache.get(key) == {
            "datasource_type": DatasourceType.TABLE,
            **data,
        }

    def test_get_explore_form_data_cache_invalid_key(self):
        assert cache_manager.explore_form_data_cache.get("foo") is None  # noqa: E711
