
"""
Utilities for handling OAuth2 errors in MCP tools.
"""

from zobi.exceptions import OAuth2RedirectError


def build_oauth2_redirect_message(ex: OAuth2RedirectError) -> str:
    """
    Build a user-facing message for OAuth2RedirectError.

    Extracts the authorization URL from the exception and includes it
    so the MCP client can present it to the user for authentication.
    """
    # extra is always set by OAuth2RedirectError.__init__
    assert ex.error.extra is not None  # noqa: S101
    oauth_url = ex.error.extra["url"]
    return (
        "This database uses OAuth for authentication. "
        "Please open the following URL in your browser to "
        "authorize access, then retry this request:\n\n"
        f"{oauth_url}"
    )


OAUTH2_CONFIG_ERROR_MESSAGE = (
    "OAuth authentication failed due to a configuration "
    "or provider error. "
    "Please contact your Zobi administrator."
)
