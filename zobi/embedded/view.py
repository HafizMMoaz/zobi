from typing import Callable

from flask import abort, current_app, request
from flask_appbuilder import expose
from flask_login import AnonymousUserMixin, login_user
from flask_wtf.csrf import same_origin

from zobi import event_logger, is_feature_enabled
from zobi.daos.dashboard import EmbeddedDashboardDAO
from zobi.utils import json
from zobi.views.base import BaseZobiView, common_bootstrap_payload
from zobi.zobi_typing import FlaskResponse


class EmbeddedView(BaseZobiView):
    """The views for embedded resources to be rendered in an iframe"""

    route_base = "/embedded"

    @expose("/<uuid>")
    @event_logger.log_this_with_extra_payload
    def embedded(
        self,
        uuid: str,
        add_extra_log_payload: Callable[..., None] = lambda **kwargs: None,
    ) -> FlaskResponse:
        """
        Server side rendering for the embedded dashboard page
        :param uuid: identifier for embedded dashboard
        :param add_extra_log_payload: added by `log_this_with_manual_updates`, set a
            default value to appease pylint
        """
        if not is_feature_enabled("EMBEDDED_ZOBI"):
            abort(404)

        embedded = EmbeddedDashboardDAO.find_by_id(uuid)

        if not embedded:
            abort(404)

        assert embedded is not None

        # validate request referrer in allowed domains
        is_referrer_allowed = not embedded.allowed_domains
        for domain in embedded.allowed_domains:
            if same_origin(request.referrer, domain):
                is_referrer_allowed = True
                break

        if not is_referrer_allowed:
            abort(403)

        # Log in as an anonymous user, just for this view.
        # This view needs to be visible to all users,
        # and building the page fails if g.user and/or ctx.user aren't present.
        login_user(AnonymousUserMixin(), force=True)

        add_extra_log_payload(
            embedded_dashboard_id=uuid,
            dashboard_version="v2",
        )

        bootstrap_data = {
            "config": {
                "GUEST_TOKEN_HEADER_NAME": current_app.config["GUEST_TOKEN_HEADER_NAME"]
            },
            "common": common_bootstrap_payload(),
            "embedded": {
                "dashboard_id": embedded.dashboard_id,
            },
        }

        return self.render_template(
            "zobi/spa.html",
            entry="embedded",
            bootstrap_data=json.dumps(
                bootstrap_data, default=json.pessimistic_json_iso_dttm_ser
            ),
        )
