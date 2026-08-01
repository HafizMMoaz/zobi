from typing import Any
from unittest.mock import patch

from flask_appbuilder.security.sqla.models import User

from zobi.models.core import Database
from zobi.utils.cache_keys import add_impersonation_cache_key_if_needed
from zobi.utils.core import override_user


def _flag(name: str):
    """Build a feature-flag side_effect that returns True only for ``name``."""

    def side_effect(feature=None):
        return feature == name

    return side_effect


def _run(database: Database) -> dict[str, Any]:
    """Run the helper against a fresh dict and return that dict."""
    cache_dict: dict[str, Any] = {}
    add_impersonation_cache_key_if_needed(database, cache_dict)
    return cache_dict


def test_no_per_user_caching_yields_no_key():
    database = Database(database_name="d", sqlalchemy_uri="sqlite://")
    with override_user(User(username="u")):
        assert "impersonation_key" not in _run(database)


@patch("zobi.utils.cache_keys.feature_flag_manager")
def test_cache_query_by_user_adds_username(feature_flag_mock):
    feature_flag_mock.is_feature_enabled.side_effect = _flag("CACHE_QUERY_BY_USER")
    database = Database(database_name="d", sqlalchemy_uri="sqlite://")
    with override_user(User(username="alice")):
        assert _run(database)["impersonation_key"] == "alice"


@patch("zobi.utils.cache_keys.feature_flag_manager")
def test_cache_query_by_user_distinct_per_user(feature_flag_mock):
    feature_flag_mock.is_feature_enabled.side_effect = _flag("CACHE_QUERY_BY_USER")
    database = Database(database_name="d", sqlalchemy_uri="sqlite://")
    with override_user(User(username="alice")):
        key_a = _run(database)["impersonation_key"]
    with override_user(User(username="bob")):
        key_b = _run(database)["impersonation_key"]
    assert key_a != key_b


@patch("zobi.utils.cache_keys.feature_flag_manager")
def test_cache_impersonation_requires_database_flag(feature_flag_mock):
    """
    CACHE_IMPERSONATION alone is not enough; ``database.impersonate_user`` must
    also be set on the database for the per-user key to apply.
    """
    feature_flag_mock.is_feature_enabled.side_effect = _flag("CACHE_IMPERSONATION")

    db_no_impersonation = Database(database_name="d", sqlalchemy_uri="sqlite://")
    db_with_impersonation = Database(
        database_name="d", sqlalchemy_uri="sqlite://", impersonate_user=True
    )

    with override_user(User(username="alice")):
        assert "impersonation_key" not in _run(db_no_impersonation)
        assert _run(db_with_impersonation)["impersonation_key"] == "alice"


def test_per_user_caching_in_extra_json_enables_key():
    database = Database(
        database_name="d",
        sqlalchemy_uri="sqlite://",
        extra='{"per_user_caching": true}',
    )
    with override_user(User(username="alice")):
        assert _run(database)["impersonation_key"] == "alice"


def test_no_user_yields_no_key(app_context):  # noqa: ARG001
    """
    With no logged-in user, the engine spec returns None even when per-user
    caching is enabled — there's no identity to key on.
    """
    database = Database(
        database_name="d",
        sqlalchemy_uri="sqlite://",
        extra='{"per_user_caching": true}',
    )
    # No override_user — g.user is unset
    assert "impersonation_key" not in _run(database)
