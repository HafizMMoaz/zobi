from typing import Any, Callable

import pytest

from zobi.utils.public_interfaces import compute_hash, get_warning_message

# These are public interfaces exposed by Zobi. Make sure
# to only change the interfaces and update the hashes in new
# major versions of Zobi.
hashes: dict[Callable[..., Any], str] = {}


@pytest.mark.parametrize("interface,expected_hash", list(hashes.items()))
def test_public_interfaces(interface, expected_hash):
    """Test that public interfaces have not been accidentally changed."""
    current_hash = compute_hash(interface)
    assert current_hash == expected_hash, get_warning_message(interface, current_hash)


def test_func_hash():
    """Test that changing a function signature changes its hash."""

    def some_function(a, b):
        return a + b

    original_hash = compute_hash(some_function)

    # pylint: disable=function-redefined
    def some_function(a, b, c):
        return a + b + c

    assert original_hash != compute_hash(some_function)


def test_class_hash():
    """Test that changing a class changes its hash."""

    # pylint: disable=too-few-public-methods, invalid-name
    class SomeClass:
        def __init__(self, a, b):
            self.a = a
            self.b = b

        def add(self):
            return self.a + self.b

    original_hash = compute_hash(SomeClass)

    # changing the __init__ should change the hash
    # pylint: disable=function-redefined, too-few-public-methods, invalid-name
    class SomeClass:
        def __init__(self, a, b, c):
            self.a = a
            self.b = b
            self.c = c

        def add(self):
            return self.a + self.b

    assert original_hash != compute_hash(SomeClass)

    # renaming a public method should change the hash
    # pylint: disable=function-redefined, too-few-public-methods, invalid-name
    class SomeClass:
        def __init__(self, a, b):
            self.a = a
            self.b = b

        def sum(self):
            return self.a + self.b

    assert original_hash != compute_hash(SomeClass)

    # adding a private method should not change the hash
    # pylint: disable=function-redefined, too-few-public-methods, invalid-name
    class SomeClass:
        def __init__(self, a, b):
            self.a = a
            self.b = b

        def add(self):
            return self._sum()

        def _sum(self):
            return self.a + self.b

    assert original_hash == compute_hash(SomeClass)
