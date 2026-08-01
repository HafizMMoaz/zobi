from typing import Any

SEPARATOR = ";"


def cache_key(*args: Any) -> str:
    return SEPARATOR.join(str(arg) for arg in args)
