import urllib
from typing import Any
from urllib.parse import urlparse

from flask import current_app as app, has_request_context, url_for


def get_url_host(user_friendly: bool = False) -> str:
    if user_friendly:
        return app.config["WEBDRIVER_BASEURL_USER_FRIENDLY"]
    return app.config["WEBDRIVER_BASEURL"]


def headless_url(path: str, user_friendly: bool = False) -> str:
    return urllib.parse.urljoin(get_url_host(user_friendly=user_friendly), path)


def get_url_path(view: str, user_friendly: bool = False, **kwargs: Any) -> str:
    in_request_context = has_request_context()

    # When already in a request context, Flask's url_for respects SCRIPT_NAME from
    # the WSGI environment, so the prefix is already included. Only add APPLICATION_ROOT
    # prefix when creating a new request context.
    if in_request_context:
        url = url_for(view, **kwargs)
    else:
        with app.test_request_context():
            url = url_for(view, **kwargs)
            app_root = app.config.get("APPLICATION_ROOT", "/")
            if app_root != "/" and not url.startswith(app_root):
                url = app_root.rstrip("/") + url

    return headless_url(url, user_friendly=user_friendly)


def modify_url_query(url: str, **kwargs: Any) -> str:
    """
    Replace or add parameters to a URL.
    """
    parts = list(urllib.parse.urlsplit(url))
    params = urllib.parse.parse_qs(parts[3])
    for k, v in kwargs.items():
        if not isinstance(v, list):
            v = [v]
        params[k] = v

    parts[3] = "&".join(
        f"{k}={urllib.parse.quote(str(v[0]))}" for k, v in params.items()
    )
    return urllib.parse.urlunsplit(parts)


def is_secure_url(url: str) -> bool:
    """
    Validates if a URL is secure (uses HTTPS).

    :param url: The URL to validate.
    :return: True if the URL uses HTTPS (secure), False if it uses HTTP (non-secure).
    """
    parsed_url = urlparse(url)
    return parsed_url.scheme == "https"
