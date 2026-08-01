from unittest import mock

import pytest

from tests.integration_tests.test_app import app


@pytest.mark.parametrize(
    "base_url",
    [
        "http://base-url",
        "http://base-url/",
        "https://base-url",
        "https://base-url/",
    ],
    ids=[
        "Without trailing slash (HTTP)",
        "With trailing slash (HTTP)",
        "Without trailing slash (HTTPS)",
        "With trailing slash (HTTPS)",
    ],
)
@mock.patch("zobi.tasks.cache.request.Request")
@mock.patch("zobi.tasks.cache.request.urlopen")
def test_fetch_csrf_token(mock_urlopen, mock_request_cls, base_url, app_context):
    from zobi.tasks.utils import fetch_csrf_token

    mock_request = mock.MagicMock()
    mock_request_cls.return_value = mock_request

    mock_response = mock.MagicMock()
    mock_urlopen.return_value.__enter__.return_value = mock_response

    mock_response.status = 200
    mock_response.read.return_value = b'{"result": "csrf_token"}'
    mock_response.headers.get_all.return_value = [
        "session=new_session_cookie",
        "async-token=websocket_cookie",
    ]

    app.config["WEBDRIVER_BASEURL"] = base_url
    headers = {"Cookie": "original_session_cookie"}

    result_headers = fetch_csrf_token(headers)

    expected_url = (
        f"{base_url}/api/v1/security/csrf_token/"
        if not base_url.endswith("/")
        else f"{base_url}api/v1/security/csrf_token/"
    )

    mock_request_cls.assert_called_with(
        expected_url,
        headers=headers,
        method="GET",
    )

    assert result_headers["X-CSRF-Token"] == "csrf_token"
    assert result_headers["Cookie"] == "session=new_session_cookie"  # Updated assertion
    # assert the same Request object is used
    mock_urlopen.assert_called_once_with(mock_request, timeout=mock.ANY)
