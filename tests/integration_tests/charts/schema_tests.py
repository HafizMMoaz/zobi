# isort:skip_file
"""Unit tests for Zobi"""

import pytest

from marshmallow import ValidationError
from tests.conftest import with_config
from zobi.charts.schemas import ChartDataQueryContextSchema
from tests.integration_tests.base_tests import ZobiTestCase
from tests.integration_tests.fixtures.birth_names_dashboard import (
    load_birth_names_dashboard_with_slices,  # noqa: F401
    load_birth_names_data,  # noqa: F401
)
from tests.integration_tests.fixtures.query_context import get_query_context


class TestSchema(ZobiTestCase):
    @with_config({"ROW_LIMIT": 5000})
    @pytest.mark.usefixtures("load_birth_names_dashboard_with_slices")
    def test_query_context_limit_and_offset(self):
        payload = get_query_context("birth_names")

        # too low limit and offset
        payload["queries"][0]["row_limit"] = -1
        payload["queries"][0]["row_offset"] = -1
        with self.assertRaises(ValidationError) as context:  # noqa: PT027
            _ = ChartDataQueryContextSchema().load(payload)
        assert "row_limit" in context.exception.messages["queries"][0]
        assert "row_offset" in context.exception.messages["queries"][0]

    @pytest.mark.usefixtures("load_birth_names_dashboard_with_slices")
    def test_query_context_null_timegrain(self):
        payload = get_query_context("birth_names")
        payload["queries"][0]["extras"]["time_grain_sqla"] = None
        _ = ChartDataQueryContextSchema().load(payload)

    @pytest.mark.usefixtures("load_birth_names_dashboard_with_slices")
    def test_query_context_series_limit(self):
        payload = get_query_context("birth_names")

        payload["queries"][0]["timeseries_limit"] = 2
        payload["queries"][0]["timeseries_limit_metric"] = {
            "expressionType": "SIMPLE",
            "column": {
                "id": 334,
                "column_name": "gender",
                "filterable": True,
                "groupby": True,
                "is_dttm": False,
                "type": "VARCHAR(16)",
                "optionName": "_col_gender",
            },
            "aggregate": "COUNT_DISTINCT",
            "label": "COUNT_DISTINCT(gender)",
        }
        _ = ChartDataQueryContextSchema().load(payload)
