"""Zobi configuration for the docker compose production stack.

This file is mounted read-only into every Zobi container at
``/app/pythonpath/zobi_config.py`` by ``docker-compose.prod.yml`` and loaded
because ``ZOBI_CONFIG_PATH`` points at that path. See
``zobi/config.py`` (``CONFIG_PATH_ENV_VAR``) for the loading mechanism: the
file is exec'd and every UPPERCASE name defined here overrides the matching
default.

It is deliberately independent of ``docker/pythonpath_dev/zobi_config.py``.
Nothing here should assume a development container, a bind-mounted source
tree, or a webpack dev server.

Everything that varies per deployment is read from the environment so that a
single copy of this file can serve every environment. Copy it and edit it if
you need behaviour that is not covered by an environment variable.
"""

import logging
import os

from cachelib.redis import RedisCache
from celery.schedules import crontab

logger = logging.getLogger(__name__)


def _env_bool(name: str, default: bool = False) -> bool:
    """Read a boolean-ish environment variable."""
    raw = os.environ.get(name)
    if raw is None or raw == "":
        return default
    return raw.strip().lower() in {"1", "true", "t", "yes", "y", "on"}


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None or raw == "":
        return default
    return int(raw)


def _require(name: str) -> str:
    value = os.environ.get(name, "")
    if not value:
        raise RuntimeError(
            f"{name} is not set. The production stack refuses to start without "
            f"it. See docs/deployment/docker-production.md."
        )
    return value


# ---------------------------------------------------------------------------
# SECRET_KEY
# ---------------------------------------------------------------------------
# Zobi uses SECRET_KEY as the encryption key for every credential it stores:
# database passwords, `encrypted_extra`, OAuth tokens and LLM provider API keys
# (see zobi/utils/encrypt.py and the `encrypted_field_factory` columns in
# zobi/models/core.py and zobi/models/llm.py).
#
# If this value changes, everything already encrypted becomes unreadable. There
# is no recovery path other than re-entering every secret by hand, or running
# `zobi re-encrypt-secrets --previous-secret-key <old>` BEFORE the old key is
# lost. Back the key up somewhere you can restore from.
#
# We refuse to boot on an empty or placeholder key rather than let an operator
# discover the problem after data has been encrypted under a throwaway value.
_PLACEHOLDER_SECRET_KEYS = {
    "CHANGE_ME_TO_A_COMPLEX_RANDOM_SECRET",
    "ZOBI_SECRET_KEY_CHANGE_ME_FOR_PRODUCTION_USE",
    "changeme",
}

SECRET_KEY = _require("ZOBI_SECRET_KEY")
if SECRET_KEY in _PLACEHOLDER_SECRET_KEYS:
    raise RuntimeError(
        "ZOBI_SECRET_KEY is still set to a placeholder value. Generate a real "
        "one with `openssl rand -base64 42` and keep a backup of it: it is the "
        "encryption key for every stored credential."
    )

# ---------------------------------------------------------------------------
# Metadata database
# ---------------------------------------------------------------------------
DATABASE_DIALECT = os.environ.get("DATABASE_DIALECT", "postgresql+psycopg2")
DATABASE_USER = _require("DATABASE_USER")
DATABASE_PASSWORD = _require("DATABASE_PASSWORD")
DATABASE_HOST = os.environ.get("DATABASE_HOST", "db")
DATABASE_PORT = os.environ.get("DATABASE_PORT", "5432")
DATABASE_DB = _require("DATABASE_DB")

SQLALCHEMY_DATABASE_URI = (
    f"{DATABASE_DIALECT}://"
    f"{DATABASE_USER}:{DATABASE_PASSWORD}@"
    f"{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_DB}"
)

# pool_pre_ping keeps long-lived gunicorn workers from handing out connections
# that the database has already closed.
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,
    "pool_recycle": _env_int("DATABASE_POOL_RECYCLE", 1800),
    "pool_size": _env_int("DATABASE_POOL_SIZE", 10),
    "max_overflow": _env_int("DATABASE_MAX_OVERFLOW", 20),
}

# No examples database in production. Loading examples is a development
# convenience and is never run by this stack.
SQLALCHEMY_EXAMPLES_URI = os.environ.get(
    "ZOBI__SQLALCHEMY_EXAMPLES_URI", SQLALCHEMY_DATABASE_URI
)

# ---------------------------------------------------------------------------
# Redis: caching, SQL Lab results and the Celery broker
# ---------------------------------------------------------------------------
REDIS_HOST = os.environ.get("REDIS_HOST", "redis")
REDIS_PORT = os.environ.get("REDIS_PORT", "6379")
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", "")
REDIS_CELERY_DB = _env_int("REDIS_CELERY_DB", 0)
REDIS_RESULTS_DB = _env_int("REDIS_RESULTS_DB", 1)
REDIS_CACHE_DB = _env_int("REDIS_CACHE_DB", 2)

_redis_auth = f":{REDIS_PASSWORD}@" if REDIS_PASSWORD else ""


def _redis_url(db: int) -> str:
    return f"redis://{_redis_auth}{REDIS_HOST}:{REDIS_PORT}/{db}"


def _cache_config(db: int, prefix: str, timeout: int) -> dict:
    config = {
        "CACHE_TYPE": "RedisCache",
        "CACHE_DEFAULT_TIMEOUT": timeout,
        "CACHE_KEY_PREFIX": prefix,
        "CACHE_REDIS_HOST": REDIS_HOST,
        "CACHE_REDIS_PORT": REDIS_PORT,
        "CACHE_REDIS_DB": db,
    }
    if REDIS_PASSWORD:
        config["CACHE_REDIS_PASSWORD"] = REDIS_PASSWORD
    return config


CACHE_CONFIG = _cache_config(REDIS_CACHE_DB, "zobi_", 60 * 60 * 24)
DATA_CACHE_CONFIG = _cache_config(REDIS_CACHE_DB, "zobi_data_", 60 * 60 * 24)
FILTER_STATE_CACHE_CONFIG = _cache_config(
    REDIS_CACHE_DB, "zobi_filter_", 60 * 60 * 24 * 90
)
EXPLORE_FORM_DATA_CACHE_CONFIG = _cache_config(
    REDIS_CACHE_DB, "zobi_form_", 60 * 60 * 24 * 7
)
THUMBNAIL_CACHE_CONFIG = _cache_config(REDIS_CACHE_DB, "zobi_thumb_", 60 * 60 * 24 * 7)

# SQL Lab async results. The development stack writes these to a filesystem
# cache under ZOBI_HOME, which forces the web and worker containers to share a
# writable volume. Redis avoids that coupling entirely.
RESULTS_BACKEND = RedisCache(
    host=REDIS_HOST,
    port=int(REDIS_PORT),
    password=REDIS_PASSWORD or None,
    db=REDIS_RESULTS_DB,
    key_prefix="zobi_results_",
)

# ---------------------------------------------------------------------------
# Celery
# ---------------------------------------------------------------------------


class CeleryConfig:  # pylint: disable=too-few-public-methods
    broker_url = _redis_url(REDIS_CELERY_DB)
    result_backend = _redis_url(REDIS_RESULTS_DB)
    imports = (
        "zobi.sql_lab",
        "zobi.tasks.scheduler",
        "zobi.tasks.thumbnails",
        "zobi.tasks.cache",
    )
    worker_prefetch_multiplier = 1
    task_acks_late = False
    beat_schedule = {
        # Drives alerts and reports. Without a running beat plus worker,
        # scheduled alerts and reports never fire.
        "reports.scheduler": {
            "task": "reports.scheduler",
            "schedule": crontab(minute="*", hour="*"),
        },
        "reports.prune_log": {
            "task": "reports.prune_log",
            "schedule": crontab(minute=10, hour=0),
        },
    }


CELERY_CONFIG = CeleryConfig

# ---------------------------------------------------------------------------
# Feature flags
# ---------------------------------------------------------------------------
# ZOBI_AI gates the LLM gateway and the Manage > AI Models menu entry
# (see zobi/initialization/__init__.py). Provider API keys entered there are
# encrypted with SECRET_KEY, so read the SECRET_KEY note above before you
# enable it.
FEATURE_FLAGS = {
    "ALERT_REPORTS": _env_bool("ZOBI_FEATURE_ALERT_REPORTS", True),
    "ZOBI_AI": _env_bool("ZOBI_FEATURE_ZOBI_AI", False),
    "DASHBOARD_RBAC": _env_bool("ZOBI_FEATURE_DASHBOARD_RBAC", False),
    "EMBEDDED_ZOBI": _env_bool("ZOBI_FEATURE_EMBEDDED_ZOBI", False),
    "ENABLE_EXTENSIONS": _env_bool("ZOBI_FEATURE_ENABLE_EXTENSIONS", False),
    "SEMANTIC_LAYERS": _env_bool("ZOBI_FEATURE_SEMANTIC_LAYERS", False),
}

# ---------------------------------------------------------------------------
# Alerts and reports
# ---------------------------------------------------------------------------
# Dry run is a development default. In production we actually send.
ALERT_REPORTS_NOTIFICATION_DRY_RUN = _env_bool("ALERT_REPORTS_DRY_RUN", False)

# Internal URL the headless browser uses to render screenshots. It has to
# resolve inside the compose network, so it points at the app service, not at
# the public hostname.
WEBDRIVER_BASEURL = os.environ.get("ZOBI_INTERNAL_URL", "http://zobi-app:8088/")
# Public URL used for the links inside report emails.
WEBDRIVER_BASEURL_USER_FRIENDLY = os.environ.get("ZOBI_PUBLIC_URL", WEBDRIVER_BASEURL)

# ---------------------------------------------------------------------------
# SMTP, needed for email reports
# ---------------------------------------------------------------------------
SMTP_HOST = os.environ.get("SMTP_HOST", "localhost")
SMTP_PORT = _env_int("SMTP_PORT", 25)
SMTP_STARTTLS = _env_bool("SMTP_STARTTLS", True)
SMTP_SSL = _env_bool("SMTP_SSL", False)
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_MAIL_FROM = os.environ.get("SMTP_MAIL_FROM", "zobi@localhost")

# ---------------------------------------------------------------------------
# Serving behind a reverse proxy
# ---------------------------------------------------------------------------
# This stack expects a TLS-terminating reverse proxy in front of gunicorn.
# ENABLE_PROXY_FIX makes Flask trust X-Forwarded-* so that generated URLs and
# logged client IPs are correct. Turn it off if nothing trustworthy sets those
# headers, otherwise a client can spoof them.
ENABLE_PROXY_FIX = _env_bool("ZOBI_ENABLE_PROXY_FIX", True)

# Only meaningful once TLS is actually terminated in front of Zobi. Leaving it
# on without HTTPS will make login impossible, hence the env toggle.
SESSION_COOKIE_SECURE = _env_bool("ZOBI_SESSION_COOKIE_SECURE", True)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOG_LEVEL = getattr(
    logging, os.environ.get("ZOBI_LOG_LEVEL", "INFO").upper(), logging.INFO
)
