"""Verifies the gateway is wired into the app the way it is meant to be.

These run against a fully initialized Zobi app, so they catch the failures
unit tests of individual modules cannot: a broken import in ``api.py``, a route
that never registered, or a permission that would let a non-admin near the
credentials.
"""

from pathlib import Path

import pytest
from flask.app import Flask

from zobi.extensions import appbuilder
from zobi.security.manager import ZobiSecurityManager


def _routes(app: Flask) -> set[str]:
    return {str(rule) for rule in app.url_map.iter_rules()}


def test_provider_crud_routes_are_registered(app: Flask) -> None:
    routes = _routes(app)
    assert "/api/v1/llm_provider/" in routes
    assert "/api/v1/llm_provider/<int:pk>" in routes


def test_provider_extra_routes_are_registered(app: Flask) -> None:
    """The endpoints the settings form depends on."""
    routes = _routes(app)
    assert "/api/v1/llm_provider/test_connection/" in routes
    assert "/api/v1/llm_provider/available/" in routes
    assert "/api/v1/llm_provider/<int:pk>/models/" in routes


def test_model_and_router_config_routes_are_registered(app: Flask) -> None:
    routes = _routes(app)
    assert "/api/v1/llm_model/" in routes
    assert "/api/v1/llm_model/<int:pk>" in routes
    assert "/api/v1/llm_router_config/" in routes


def test_settings_page_route_is_registered(app: Flask) -> None:
    """Manage > AI Models points at the React page."""
    assert "/llm/list/" in _routes(app)


@pytest.mark.parametrize(
    "view_name",
    ["LLMProvider", "LLMModel", "LLMRouterConfig"],
)
def test_gateway_views_are_admin_only(view_name: str) -> None:
    """Providers hold API credentials, so no other role may reach them.

    Guards against a future refactor quietly widening access by dropping one
    of these from the admin-only set.
    """
    assert view_name in ZobiSecurityManager.ADMIN_ONLY_VIEW_MENUS


def test_gateway_apis_are_registered_with_appbuilder(app: Flask) -> None:
    registered = {type(view).__name__ for view in appbuilder.baseviews}
    assert "LLMProviderRestApi" in registered
    assert "LLMModelRestApi" in registered
    assert "LLMRouterConfigRestApi" in registered


def test_feature_flag_is_registered(app: Flask) -> None:
    from zobi.config import DEFAULT_FEATURE_FLAGS

    assert "ZOBI_AI" in DEFAULT_FEATURE_FLAGS


def test_feature_flag_ships_disabled() -> None:
    """The gateway ships dark until an operator turns it on.

    Asserted against the source rather than the imported dict:
    ``FeatureFlagManager.init_app`` binds ``DEFAULT_FEATURE_FLAGS`` by
    reference and updates it in place, so any earlier test that enabled a flag
    has already mutated the value this process would read back.
    """
    import zobi.config

    source = Path(zobi.config.__file__).read_text(encoding="utf-8")

    assert '"ZOBI_AI": False,' in source
