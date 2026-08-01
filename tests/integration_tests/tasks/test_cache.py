from unittest import mock

import pytest

from tests.integration_tests.test_app import app


@pytest.mark.parametrize(
    "base_url, expected_referer",
    [
        ("http://base-url", None),
        ("http://base-url/", None),
        ("https://base-url", "https://base-url/api/v1/chart/warm_up_cache"),
        ("https://base-url/", "https://base-url/api/v1/chart/warm_up_cache"),
    ],
    ids=[
        "Without trailing slash (HTTP)",
        "With trailing slash (HTTP)",
        "Without trailing slash (HTTPS)",
        "With trailing slash (HTTPS)",
    ],
)
@mock.patch("zobi.tasks.cache.fetch_csrf_token")
@mock.patch("zobi.tasks.cache.request.Request")
@mock.patch("zobi.tasks.cache.request.urlopen")
@mock.patch("zobi.tasks.cache.is_secure_url")
def test_fetch_url(
    mock_is_secure_url,
    mock_urlopen,
    mock_request_cls,
    mock_fetch_csrf_token,
    base_url,
    expected_referer,
):
    from zobi.tasks.cache import fetch_url

    mock_request = mock.MagicMock()
    mock_request_cls.return_value = mock_request

    mock_urlopen.return_value = mock.MagicMock()
    mock_urlopen.return_value.code = 200

    # Mock the URL validation to return True for HTTPS and False for HTTP
    mock_is_secure_url.return_value = base_url.startswith("https")

    initial_headers = {"Cookie": "cookie", "key": "value"}
    csrf_headers = initial_headers | {"X-CSRF-Token": "csrf_token"}

    # Conditionally add the Referer header and assert its presence
    if expected_referer:
        csrf_headers = csrf_headers | {"Referer": expected_referer}
        assert csrf_headers["Referer"] == expected_referer

    mock_fetch_csrf_token.return_value = csrf_headers

    app.config["WEBDRIVER_BASEURL"] = base_url
    data = "data"
    data_encoded = b"data"

    result = fetch_url(data, initial_headers)

    expected_url = (
        f"{base_url}/api/v1/chart/warm_up_cache"
        if not base_url.endswith("/")
        else f"{base_url}api/v1/chart/warm_up_cache"
    )

    mock_fetch_csrf_token.assert_called_once_with(initial_headers)

    mock_request_cls.assert_called_once_with(
        expected_url,  # Use the dynamic URL based on base_url
        data=data_encoded,
        headers=csrf_headers,
        method="PUT",
    )
    # assert the same Request object is used
    mock_urlopen.assert_called_once_with(mock_request, timeout=mock.ANY)

    assert data == result["success"]
