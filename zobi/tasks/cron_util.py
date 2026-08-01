
import logging
from collections.abc import Iterator
from datetime import datetime, timedelta

from croniter import croniter
from flask import current_app
from pytz import timezone as pytz_timezone, UnknownTimeZoneError

logger = logging.getLogger(__name__)


def cron_schedule_window(
    triggered_at: datetime, cron: str, timezone: str
) -> Iterator[datetime]:
    window_size = current_app.config["ALERT_REPORTS_CRON_WINDOW_SIZE"]
    try:
        tz = pytz_timezone(timezone)
    except UnknownTimeZoneError:
        # fallback to default timezone
        tz = pytz_timezone("UTC")
        logger.warning("Timezone %s was invalid. Falling back to 'UTC'", timezone)
    utc = pytz_timezone("UTC")
    # convert the current time to the user's local time for comparison
    time_now = triggered_at.astimezone(tz)
    start_at = time_now - timedelta(seconds=window_size / 2)
    stop_at = time_now + timedelta(seconds=window_size / 2)
    crons = croniter(cron, start_at)
    for schedule in crons.all_next(datetime):
        if schedule >= stop_at:
            break
        # convert schedule back to utc
        yield schedule.astimezone(utc).replace(tzinfo=None)
