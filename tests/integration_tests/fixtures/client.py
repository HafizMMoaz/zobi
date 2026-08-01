import pytest

from tests.integration_tests.test_app import app


@pytest.fixture
def client():
    with app.test_client() as client:
        with app.app_context():
            yield client
