import uuid
from typing import Any, cast, TypeVar, Union

from zobi.utils import json


def serialize(params: dict[str, Any]) -> str:
    """
    Serialize parameters into a string.
    """

    T = TypeVar(
        "T",
        bound=Union[dict[str, Any], list[Any], int, float, str, bool, None],
    )

    def sort(obj: T) -> T:
        if isinstance(obj, dict):
            return cast(T, {k: sort(v) for k, v in sorted(obj.items())})
        if isinstance(obj, list):
            return cast(T, [sort(x) for x in obj])
        return obj

    return json.dumps(params)


def get_key(namespace: str, **kwargs: Any) -> uuid.UUID:
    return uuid.uuid5(uuid.uuid5(uuid.NAMESPACE_DNS, namespace), serialize(kwargs))
