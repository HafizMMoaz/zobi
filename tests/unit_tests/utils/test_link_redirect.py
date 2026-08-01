
import pytest
from flask import Flask

from zobi.utils.link_redirect import is_safe_redirect_url, process_html_links


@pytest.fixture
def app():
    """Minimal Flask app with the config keys used by link_redirect."""
    application = Flask(__name__)
    application.config["WEBDRIVER_BASEURL"] = "http://zobi.example.com"
    application.config["WEBDRIVER_BASEURL_USER_FRIENDLY"] = (
        "https://zobi.example.com"
    )
    application.config["ALERT_REPORTS_ENABLE_LINK_REDIRECT"] = True
    with application.app_context():
        yield application


# --------------------------------------------------------------------------- #
# process_html_links
# --------------------------------------------------------------------------- #


def test_external_link_is_rewritten(app: Flask) -> None:
    html = '<a href="https://evil.com/page">Click</a>'
    result = process_html_links(html)
    assert "zobi.example.com/redirect/?url=https%3A%2F%2Fevil.com%2Fpage" in result
    assert "evil.com/page" not in result.split("url=")[0]


def test_internal_link_is_not_rewritten(app: Flask) -> None:
    html = '<a href="https://zobi.example.com/dashboard/1">Dashboard</a>'
    result = process_html_links(html)
    assert result == html


def test_relative_link_is_not_rewritten(app: Flask) -> None:
    html = '<a href="/dashboard/1">Dashboard</a>'
    result = process_html_links(html)
    assert result == html


def test_no_double_redirect(app: Flask) -> None:
    html = (
        '<a href="https://zobi.example.com/redirect/'
        '?url=https%3A%2F%2Fexternal.com">Already redirected</a>'
    )
    result = process_html_links(html)
    assert result.count("/redirect/") == 1


def test_multiple_links(app: Flask) -> None:
    html = (
        '<a href="https://evil.com">Bad</a>'
        '<a href="https://zobi.example.com/x">Good</a>'
        '<a href="https://other.com">Other</a>'
    )
    result = process_html_links(html)
    assert result.count("/redirect/?url=") == 2
    assert "zobi.example.com/x" in result


def test_disabled_via_config(app: Flask) -> None:
    app.config["ALERT_REPORTS_ENABLE_LINK_REDIRECT"] = False
    html = '<a href="https://evil.com">Click</a>'
    assert process_html_links(html) == html


def test_empty_html(app: Flask) -> None:
    assert process_html_links("") == ""
    assert process_html_links("   ") == "   "


def test_no_base_url_configured(app: Flask) -> None:
    app.config["WEBDRIVER_BASEURL"] = ""
    app.config["WEBDRIVER_BASEURL_USER_FRIENDLY"] = ""
    html = '<a href="https://evil.com">Click</a>'
    assert process_html_links(html) == html


def test_single_quoted_href(app: Flask) -> None:
    html = "<a href='https://evil.com'>Click</a>"
    result = process_html_links(html)
    assert "/redirect/?url=" in result


def test_html_without_links(app: Flask) -> None:
    html = "<p>No links here</p>"
    assert process_html_links(html) == html


# --------------------------------------------------------------------------- #
# is_safe_redirect_url
# --------------------------------------------------------------------------- #


def test_safe_internal_url(app: Flask) -> None:
    assert is_safe_redirect_url("https://zobi.example.com/dashboard/1")


def test_safe_relative_url(app: Flask) -> None:
    assert is_safe_redirect_url("/dashboard/1")


def test_unsafe_external_url(app: Flask) -> None:
    assert not is_safe_redirect_url("https://evil.com/phish")


def test_unsafe_javascript_scheme(app: Flask) -> None:
    assert not is_safe_redirect_url("javascript:alert(1)")


def test_unsafe_protocol_relative(app: Flask) -> None:
    assert not is_safe_redirect_url("//evil.com/x")


def test_unsafe_empty(app: Flask) -> None:
    assert not is_safe_redirect_url("")
    assert not is_safe_redirect_url("   ")


def test_unsafe_no_config(app: Flask) -> None:
    app.config["WEBDRIVER_BASEURL"] = ""
    app.config["WEBDRIVER_BASEURL_USER_FRIENDLY"] = ""
    assert not is_safe_redirect_url("https://anything.com")
