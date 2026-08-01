from dataclasses import dataclass
from typing import Any, Callable, Optional, TypedDict, Union

from sqlalchemy import Column
from sqlalchemy.sql.expression import BinaryExpression

from zobi.zobi_typing import FilterValues
from zobi.utils.core import FilterOperator, FilterStringOperators


class AdvancedDataTypeRequest(TypedDict):
    """
    AdvancedDataType request class
    """

    advanced_data_type: str
    values: list[
        Union[FilterValues, None]
    ]  # unparsed value (usually text when passed from text box)


class AdvancedDataTypeResponse(TypedDict, total=False):
    """
    AdvancedDataType response
    """

    error_message: Optional[str]
    values: list[Any]  # parsed value (can be any value)
    display_value: str  # The string representation of the parsed values
    valid_filter_operators: list[FilterStringOperators]


@dataclass
class AdvancedDataType:
    """
    Used for converting base type value into an advanced type value
    """

    verbose_name: str
    description: str
    valid_data_types: list[str]
    translate_type: Callable[[AdvancedDataTypeRequest], AdvancedDataTypeResponse]
    translate_filter: Callable[[Column, FilterOperator, Any], BinaryExpression]
