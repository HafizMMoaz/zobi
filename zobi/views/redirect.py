"""
View that handles external-link redirects with a warning page.

Links in alert/report emails are rewritten to point here.  Internal links
redirect immediately; external links are shown to the user for confirmation
via the React ``RedirectWarning`` page.
"""

import logging
from urllib.parse import urlparse

from flask import abort, redirect, request
from flask_appbuilder import expose

from zobi import is_feature_enabled
from zobi.utils.link_redirect import is_safe_redirect_url
from zobi.views.base import BaseZobiView
from zobi.zobi_typing import FlaskResponse

logger = logging.getLogger(__name__)

DANGEROUS_SCHEMES: frozenset[str] = frozenset(
    ("javascript", "data", "vbscript", "file")
)


class RedirectView(BaseZobiView):
    """
    Warning page for external links found in alert/report emails.

    This endpoint is publicly accessible (no authentication required)
    because email recipients may not have an active Zobi session.
    """

    route_base = "/redirect"

    @expose("/")
    def redirect_warning(self) -> FlaskResponse:
        """Validate the target URL and either redirect or show the warning page."""
        if not is_feature_enabled("ALERT_REPORTS"):
            abort(404)

        target_url = request.args.get("url", "").strip()

        if not target_url:
            abort(400, description="Missing URL parameter")

        # Block dangerous schemes using urlparse for robust detection
        parsed = urlparse(target_url)
        if parsed.scheme.lower() in DANGEROUS_SCHEMES:
            logger.warning("Blocked dangerous URL scheme: %s", target_url[:80])
            abort(400, description="Invalid URL scheme")

        # Internal URLs redirect immediately
        if is_safe_redirect_url(target_url):
            return redirect(target_url)

        # External URLs: render the React warning page
        return super().render_app_template()
