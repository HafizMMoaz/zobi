from flask import Blueprint, current_app as app, jsonify

from zobi import talisman
from zobi.stats_logger import BaseStatsLogger
from zobi.zobi_typing import FlaskResponse

health_blueprint = Blueprint("health", __name__)


@health_blueprint.route("/health")
@health_blueprint.route("/healthcheck")
@health_blueprint.route("/ping")
@talisman(force_https=False)
def health() -> FlaskResponse:
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("health")
    return "OK"


@health_blueprint.route("/version")
@talisman(force_https=False)
def version() -> FlaskResponse:
    """
    Return comprehensive version information including Git SHA
    and branch when available.
    """
    from zobi.utils.version import get_version_metadata

    return jsonify(get_version_metadata())
