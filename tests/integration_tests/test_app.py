from os import environ
from typing import TYPE_CHECKING

from zobi.app import create_app

if TYPE_CHECKING:
    from typing import Any

    from flask.testing import FlaskClient


# DEPRECATED: Creating global app instance - use app fixture from conftest.py instead
zobi_config_module = environ.get(
    "ZOBI_CONFIG", "tests.integration_tests.zobi_test_config"
)
app = create_app(zobi_config_module=zobi_config_module)


def login(
    client: "FlaskClient[Any]",
    username: str = "admin",
    password: str = "general",  # noqa: S107
):
    resp = client.post(
        "/login/",
        data=dict(username=username, password=password),  # noqa: C408
    ).get_data(as_text=True)
    assert "User confirmation needed" not in resp
    return resp
