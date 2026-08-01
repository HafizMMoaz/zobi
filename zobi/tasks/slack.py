import logging

from flask import current_app

from zobi.extensions import celery_app
from zobi.utils.slack import get_channels

logger = logging.getLogger(__name__)


@celery_app.task(name="slack.cache_channels")
def cache_channels() -> None:
    cache_timeout = current_app.config["SLACK_CACHE_TIMEOUT"]
    retry_count = current_app.config.get("SLACK_API_RATE_LIMIT_RETRY_COUNT", 2)

    logger.info(
        "Starting Slack channels cache warm-up task "
        "(cache_timeout=%ds, retry_count=%d)",
        cache_timeout,
        retry_count,
    )

    try:
        get_channels(force=True, cache_timeout=cache_timeout)
    except Exception as ex:
        logger.exception(
            "Failed to cache Slack channels: %s. "
            "If this is due to rate limiting, consider increasing "
            "SLACK_API_RATE_LIMIT_RETRY_COUNT.",
            str(ex),
        )
        raise
