from __future__ import annotations

from contextlib import nullcontext
from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

import pytest
from flask.ctx import AppContext
from freezegun import freeze_time

from zobi.extensions.metastore_cache import ZobiMetastoreCache
from zobi.key_value.exceptions import (
    KeyValueCreateFailedError,
)
from zobi.key_value.types import (
    JsonKeyValueCodec,
    KeyValueCodec,
    PickleKeyValueCodec,
)

NAMESPACE = UUID("ee173d1b-ccf3-40aa-941c-985c15224496")

FIRST_KEY = "foo"
FIRST_KEY_INITIAL_VALUE = {"foo": "bar"}
FIRST_KEY_UPDATED_VALUE = "foo"

SECOND_KEY = "baz"
SECOND_VALUE = "qwerty"


@pytest.fixture
def cache() -> ZobiMetastoreCache:
    return ZobiMetastoreCache(
        namespace=NAMESPACE,
        default_timeout=600,
        codec=PickleKeyValueCodec(),
    )


def test_caching_flow(app_context: AppContext, cache: ZobiMetastoreCache) -> None:
    # Clean up any existing keys first to ensure idempotency
    cache.delete(FIRST_KEY)
    cache.delete(SECOND_KEY)

    assert cache.has(FIRST_KEY) is False
    assert cache.add(FIRST_KEY, FIRST_KEY_INITIAL_VALUE) is True
    assert cache.has(FIRST_KEY) is True
    assert cache.get(FIRST_KEY) == FIRST_KEY_INITIAL_VALUE
    cache.set(SECOND_KEY, SECOND_VALUE)
    assert cache.get(FIRST_KEY) == FIRST_KEY_INITIAL_VALUE
    assert cache.get(SECOND_KEY) == SECOND_VALUE
    assert cache.add(FIRST_KEY, FIRST_KEY_UPDATED_VALUE) is False
    assert cache.get(FIRST_KEY) == FIRST_KEY_INITIAL_VALUE
    assert cache.set(FIRST_KEY, FIRST_KEY_UPDATED_VALUE) is True  # noqa: E712
    assert cache.get(FIRST_KEY) == FIRST_KEY_UPDATED_VALUE
    cache.delete(FIRST_KEY)
    assert cache.has(FIRST_KEY) is False
    assert cache.get(FIRST_KEY) is None
    assert cache.has(SECOND_KEY)
    assert cache.get(SECOND_KEY) == SECOND_VALUE

    # Clean up after test as well for good measure
    cache.delete(SECOND_KEY)


def test_expiry(app_context: AppContext, cache: ZobiMetastoreCache) -> None:
    # Clean up any existing keys first to ensure idempotency
    cache.delete(FIRST_KEY)

    delta = timedelta(days=90)
    dttm = datetime(2022, 3, 18, 0, 0, 0)

    # 1. initialize cached values, ensure they're found
    with freeze_time(dttm):
        assert (
            cache.set(FIRST_KEY, FIRST_KEY_INITIAL_VALUE, int(delta.total_seconds()))
            is True
        )
        assert cache.get(FIRST_KEY) == FIRST_KEY_INITIAL_VALUE

    # 2. ensure cached values are available a moment before expiration
    with freeze_time(dttm + delta - timedelta(seconds=1)):
        assert cache.has(FIRST_KEY) is True
        assert cache.get(FIRST_KEY) == FIRST_KEY_INITIAL_VALUE

    # 3. ensure cached entries expire
    with freeze_time(dttm + delta + timedelta(seconds=1)):
        assert cache.has(FIRST_KEY) is False
        assert cache.get(FIRST_KEY) is None

        # adding a value with the same key as an expired entry works
        assert cache.add(FIRST_KEY, SECOND_VALUE, int(delta.total_seconds())) is True
        assert cache.get(FIRST_KEY) == SECOND_VALUE

    # Clean up after test as well for good measure
    cache.delete(FIRST_KEY)


@pytest.mark.parametrize(
    "input_,codec,expected_result",
    [
        ({"foo": "bar"}, JsonKeyValueCodec(), {"foo": "bar"}),
        (("foo", "bar"), JsonKeyValueCodec(), ["foo", "bar"]),
        (complex(1, 1), JsonKeyValueCodec(), KeyValueCreateFailedError()),
        ({"foo": "bar"}, PickleKeyValueCodec(), {"foo": "bar"}),
        (("foo", "bar"), PickleKeyValueCodec(), ("foo", "bar")),
        (complex(1, 1), PickleKeyValueCodec(), complex(1, 1)),
    ],
)
def test_codec(
    input_: Any,
    codec: KeyValueCodec,
    expected_result: Any,
    app_context: AppContext,
) -> None:
    from zobi.extensions.metastore_cache import ZobiMetastoreCache

    cache = ZobiMetastoreCache(
        namespace=NAMESPACE,
        default_timeout=600,
        codec=codec,
    )

    # Clean up any existing keys first to ensure idempotency
    cache.delete(FIRST_KEY)

    cm = (
        pytest.raises(type(expected_result))
        if isinstance(expected_result, Exception)
        else nullcontext()
    )
    with cm:
        cache.set(FIRST_KEY, input_)
        assert cache.get(FIRST_KEY) == expected_result

    # Clean up after test as well for good measure
    cache.delete(FIRST_KEY)
