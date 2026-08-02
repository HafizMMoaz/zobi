import pytest
from flask.ctx import AppContext

from tests.integration_tests.test_app import app
from zobi.extensions import db, security_manager


@pytest.fixture
def public_role_like_gamma(app_context: AppContext):
    app.config["PUBLIC_ROLE_LIKE"] = "Gamma"
    security_manager.sync_role_definitions()

    yield

    security_manager.get_public_role().permissions = []
    db.session.commit()


@pytest.fixture
def public_role_like_test_role(app_context: AppContext):
    app.config["PUBLIC_ROLE_LIKE"] = "TestRole"
    security_manager.sync_role_definitions()

    yield

    security_manager.get_public_role().permissions = []
    db.session.commit()


@pytest.fixture
def public_role_builtin(app_context: AppContext):
    """
    Fixture that uses the built-in Public role with minimal read-only permissions.
    This sets PUBLIC_ROLE_LIKE to "Public" to use the new sensible defaults.
    """
    original_value = app.config.get("PUBLIC_ROLE_LIKE")
    app.config["PUBLIC_ROLE_LIKE"] = "Public"
    security_manager.sync_role_definitions()

    yield

    # Restore original config and clean up
    app.config["PUBLIC_ROLE_LIKE"] = original_value
    security_manager.get_public_role().permissions = []
    db.session.commit()
