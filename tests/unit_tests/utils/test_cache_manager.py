import hashlib
from unittest.mock import MagicMock, patch

import pytest

from zobi.utils.cache_manager import (
    configurable_hash_method,
    ConfigurableHashMethod,
    ZobiCache,
)


def test_configurable_hash_method_uses_sha256():
    """Test ConfigurableHashMethod uses sha256 when configured."""
    mock_app = MagicMock()
    mock_app.config = {"HASH_ALGORITHM": "sha256"}

    with patch("zobi.utils.cache_manager.current_app", mock_app):
        hash_obj = configurable_hash_method(b"test")
        # Verify it returns a sha256 hash object
        assert hash_obj.hexdigest() == hashlib.sha256(b"test").hexdigest()


def test_configurable_hash_method_uses_md5():
    """Test ConfigurableHashMethod uses md5 when configured."""
    mock_app = MagicMock()
    mock_app.config = {"HASH_ALGORITHM": "md5"}

    with patch("zobi.utils.cache_manager.current_app", mock_app):
        hash_obj = configurable_hash_method(b"test")
        # Verify it returns a md5 hash object
        assert hash_obj.hexdigest() == hashlib.md5(b"test").hexdigest()  # noqa: S324


def test_configurable_hash_method_empty_data():
    """Test ConfigurableHashMethod with empty data."""
    mock_app = MagicMock()
    mock_app.config = {"HASH_ALGORITHM": "sha256"}

    with patch("zobi.utils.cache_manager.current_app", mock_app):
        hash_obj = configurable_hash_method()
        assert hash_obj.hexdigest() == hashlib.sha256(b"").hexdigest()


def test_configurable_hash_method_is_callable():
    """Test that ConfigurableHashMethod instance is callable."""
    method = ConfigurableHashMethod()
    assert callable(method)


def test_zobi_cache_memoize_uses_configurable_hash():
    """Test that ZobiCache.memoize uses configurable_hash_method by default."""
    cache = ZobiCache()

    with patch.object(
        cache.__class__.__bases__[0], "memoize", return_value=lambda f: f
    ) as mock_memoize:
        cache.memoize(timeout=300)

        mock_memoize.assert_called_once()
        call_kwargs = mock_memoize.call_args[1]
        assert call_kwargs["hash_method"] is configurable_hash_method


def test_zobi_cache_memoize_allows_explicit_hash_method():
    """Test that ZobiCache.memoize allows explicit hash_method override."""
    cache = ZobiCache()

    with patch.object(
        cache.__class__.__bases__[0], "memoize", return_value=lambda f: f
    ) as mock_memoize:
        cache.memoize(timeout=300, hash_method=hashlib.md5)

        mock_memoize.assert_called_once()
        call_kwargs = mock_memoize.call_args[1]
        assert call_kwargs["hash_method"] == hashlib.md5


def test_zobi_cache_cached_uses_configurable_hash():
    """Test that ZobiCache.cached uses configurable_hash_method by default."""
    cache = ZobiCache()

    with patch.object(
        cache.__class__.__bases__[0], "cached", return_value=lambda f: f
    ) as mock_cached:
        cache.cached(timeout=300)

        mock_cached.assert_called_once()
        call_kwargs = mock_cached.call_args[1]
        assert call_kwargs["hash_method"] is configurable_hash_method


def test_zobi_cache_cached_allows_explicit_hash_method():
    """Test that ZobiCache.cached allows explicit hash_method override."""
    cache = ZobiCache()

    with patch.object(
        cache.__class__.__bases__[0], "cached", return_value=lambda f: f
    ) as mock_cached:
        cache.cached(timeout=300, hash_method=hashlib.md5)

        mock_cached.assert_called_once()
        call_kwargs = mock_cached.call_args[1]
        assert call_kwargs["hash_method"] == hashlib.md5


def test_zobi_cache_memoize_make_cache_key_uses_configurable_hash():
    """Test _memoize_make_cache_key uses configurable_hash_method by default."""
    cache = ZobiCache()

    with patch.object(
        cache.__class__.__bases__[0],
        "_memoize_make_cache_key",
        return_value=lambda *args, **kwargs: "cache_key",
    ) as mock_make_key:
        cache._memoize_make_cache_key(make_name=None, timeout=300)

        mock_make_key.assert_called_once()
        call_kwargs = mock_make_key.call_args[1]
        assert call_kwargs["hash_method"] is configurable_hash_method


def test_zobi_cache_memoize_make_cache_key_allows_explicit_hash():
    """Test _memoize_make_cache_key allows explicit hash_method override."""
    cache = ZobiCache()

    with patch.object(
        cache.__class__.__bases__[0],
        "_memoize_make_cache_key",
        return_value=lambda *args, **kwargs: "cache_key",
    ) as mock_make_key:
        cache._memoize_make_cache_key(
            make_name=None, timeout=300, hash_method=hashlib.md5
        )

        mock_make_key.assert_called_once()
        call_kwargs = mock_make_key.call_args[1]
        assert call_kwargs["hash_method"] == hashlib.md5


@pytest.mark.parametrize(
    "algorithm,expected_digest",
    [
        ("sha256", hashlib.sha256(b"test_data").hexdigest()),
        ("md5", hashlib.md5(b"test_data").hexdigest()),  # noqa: S324
    ],
)
def test_configurable_hash_method_parametrized(algorithm, expected_digest):
    """Parametrized test for ConfigurableHashMethod with different algorithms."""
    mock_app = MagicMock()
    mock_app.config = {"HASH_ALGORITHM": algorithm}

    with patch("zobi.utils.cache_manager.current_app", mock_app):
        hash_obj = configurable_hash_method(b"test_data")
        assert hash_obj.hexdigest() == expected_digest
