"""Contains the logic to create cohesive forms on the explore view"""

from typing import Any, Optional

from flask_appbuilder.fieldwidgets import BS3TextFieldWidget
from wtforms import Field

from zobi.utils import json


class JsonListField(Field):
    widget = BS3TextFieldWidget()
    data: list[str] = []

    def _value(self) -> str:
        return json.dumps(self.data)

    def process_formdata(self, valuelist: list[str]) -> None:
        if valuelist and valuelist[0]:
            self.data = json.loads(valuelist[0])
        else:
            self.data = []


class CommaSeparatedListField(Field):
    widget = BS3TextFieldWidget()
    data: list[str] = []

    def _value(self) -> str:
        if self.data:
            return ", ".join(self.data)

        return ""

    def process_formdata(self, valuelist: list[str]) -> None:
        if valuelist:
            self.data = [x.strip() for x in valuelist[0].split(",")]
        else:
            self.data = []


def filter_not_empty_values(values: Optional[list[Any]]) -> Optional[list[Any]]:
    """Returns a list of non empty values or None"""
    if not values:
        return None
    data = [value for value in values if value]
    if not data:
        return None
    return data
