# isort:skip_file
"""Unit tests for Zobi"""

import rison

from zobi.utils.core import get_example_default_schema  # noqa: F401

from tests.integration_tests.utils.get_dashboards import get_dashboards_ids  # noqa: F401
from tests.conftest import with_config
from sqlalchemy import Column
from typing import Any
from zobi.advanced_data_type.types import (
    AdvancedDataType,
    AdvancedDataTypeRequest,
    AdvancedDataTypeResponse,
)
from zobi.utils.core import FilterOperator, FilterStringOperators
from zobi.utils import json


target_resp: AdvancedDataTypeResponse = {
    "values": [],
    "error_message": "",
    "display_value": "",
    "valid_filter_operators": [
        FilterStringOperators.EQUALS,
        FilterStringOperators.GREATER_THAN_OR_EQUAL,
        FilterStringOperators.GREATER_THAN,
        FilterStringOperators.IN,
        FilterStringOperators.LESS_THAN,
        FilterStringOperators.LESS_THAN_OR_EQUAL,
    ],
}


def translation_func(req: AdvancedDataTypeRequest) -> AdvancedDataTypeResponse:
    return target_resp


def translate_filter_func(col: Column, op: FilterOperator, values: list[Any]):
    pass


test_type: AdvancedDataType = AdvancedDataType(
    verbose_name="type",
    valid_data_types=["int"],
    translate_type=translation_func,
    description="",
    translate_filter=translate_filter_func,
)

CHART_DATA_URI = "api/v1/chart/advanced_data_type"
CHARTS_FIXTURE_COUNT = 10


@with_config({"ADVANCED_DATA_TYPES": {"type": 1}})
def test_types_type_request(test_client, login_as_admin):
    """
    Advanced Data Type API: Test to see if the API call returns all the valid advanced data types
    """  # noqa: E501
    uri = "api/v1/advanced_data_type/types"  # noqa: F541
    response_value = test_client.get(uri)
    data = json.loads(response_value.data.decode("utf-8"))
    assert response_value.status_code == 200
    assert data == {"result": ["type"]}


def test_types_convert_bad_request_no_vals(test_client, login_as_admin):
    """
    Advanced Data Type API: Test request to see if it behaves as expected when no values are passed
    """  # noqa: E501
    arguments = {"type": "type", "values": []}
    uri = f"api/v1/advanced_data_type/convert?q={rison.dumps(arguments)}"
    response_value = test_client.get(uri)
    assert response_value.status_code == 400


def test_types_convert_bad_request_no_type(test_client, login_as_admin):
    """
    Advanced Data Type API: Test request to see if it behaves as expected when no type is passed
    """  # noqa: E501
    arguments = {"type": "", "values": [1]}
    uri = f"api/v1/advanced_data_type/convert?q={rison.dumps(arguments)}"
    response_value = test_client.get(uri)
    assert response_value.status_code == 400


@with_config({"ADVANCED_DATA_TYPES": {"type": 1}})
def test_types_convert_bad_request_type_not_found(test_client, login_as_admin):
    """
    Advanced Data Type API: Test request to see if it behaves as expected when passed in type is
    not found/not valid
    """  # noqa: E501
    arguments = {"type": "not_found", "values": [1]}
    uri = f"api/v1/advanced_data_type/convert?q={rison.dumps(arguments)}"
    response_value = test_client.get(uri)
    assert response_value.status_code == 400


@with_config({"ADVANCED_DATA_TYPES": {"type": test_type}})
def test_types_convert_request(test_client, login_as_admin):
    """
    Advanced Data Type API: Test request to see if it behaves as expected when a valid type
    and valid values are passed in
    """  # noqa: E501
    arguments = {"type": "type", "values": [1]}
    uri = f"api/v1/advanced_data_type/convert?q={rison.dumps(arguments)}"
    response_value = test_client.get(uri)
    assert response_value.status_code == 200
    data = json.loads(response_value.data.decode("utf-8"))
    assert data == {"result": target_resp}
