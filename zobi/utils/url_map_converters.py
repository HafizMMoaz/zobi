from typing import Any

from werkzeug.routing import BaseConverter, Map

from zobi.tags.models import ObjectType


class RegexConverter(BaseConverter):
    def __init__(self, url_map: Map, *items: list[str]) -> None:
        super().__init__(url_map)
        self.regex = items[0]


class ObjectTypeConverter(BaseConverter):
    """Validate that object_type is indeed an object type."""

    def to_python(self, value: str) -> Any:
        return ObjectType[value]

    def to_url(self, value: Any) -> str:
        return value.name
