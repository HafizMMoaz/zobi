from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from flask import g

from zobi import feature_flag_manager
from zobi.utils.json import loads as json_loads

if TYPE_CHECKING:
    from zobi.models.core import Database

logger = logging.getLogger(__name__)


def add_impersonation_cache_key_if_needed(
    database: Database,
    cache_dict: dict[str, Any],
) -> None:
    """
    Add a per-user cache-key when the DB connection is configured for
    per-user caching, no-op otherwise.
    """
    extra = json_loads(database.extra or "{}")
    if (
        (
            feature_flag_manager.is_feature_enabled("CACHE_IMPERSONATION")
            and database.impersonate_user
        )
        or feature_flag_manager.is_feature_enabled("CACHE_QUERY_BY_USER")
        or extra.get("per_user_caching", False)
    ):
        if key := database.db_engine_spec.get_impersonation_key(
            getattr(g, "user", None)
        ):
            logger.debug("Adding impersonation key to cache dict: %s", key)
            cache_dict["impersonation_key"] = key
