"""
MCP service test configuration.

Disables RBAC permission checks for integration tests.
RBAC logic is tested directly in test_auth_rbac.py.
"""

import pytest


@pytest.fixture(autouse=True)
def disable_mcp_rbac(app):
    """Disable RBAC permission checks for MCP integration tests.

    The RBAC permission logic is tested directly in test_auth_rbac.py.
    Integration tests use mock users that do not have real FAB roles,
    so we disable RBAC to let them exercise tool logic.
    """
    app.config["MCP_RBAC_ENABLED"] = False
    yield
    app.config.pop("MCP_RBAC_ENABLED", None)
