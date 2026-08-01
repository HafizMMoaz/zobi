from parameterized import parameterized
from sqlalchemy import column

from zobi.constants import TimeGrain
from zobi.db_engine_specs.elasticsearch import ElasticSearchEngineSpec
from tests.integration_tests.base_tests import ZobiTestCase


class TestElasticsearchDbEngineSpec(ZobiTestCase):
    @parameterized.expand(
        [
            [TimeGrain.SECOND, "DATE_TRUNC('second', ts)"],
            [TimeGrain.MINUTE, "DATE_TRUNC('minute', ts)"],
            [TimeGrain.HOUR, "DATE_TRUNC('hour', ts)"],
            [TimeGrain.DAY, "DATE_TRUNC('day', ts)"],
            [TimeGrain.WEEK, "DATE_TRUNC('week', ts)"],
            [TimeGrain.MONTH, "DATE_TRUNC('month', ts)"],
            [TimeGrain.YEAR, "DATE_TRUNC('year', ts)"],
        ]
    )
    def test_time_grain_expressions(self, time_grain, expected_time_grain_expression):
        col = column("ts")
        col.type = "DATETIME"
        actual = ElasticSearchEngineSpec.get_timestamp_expr(
            col=col, pdf=None, time_grain=time_grain
        )
        assert str(actual) == expected_time_grain_expression
