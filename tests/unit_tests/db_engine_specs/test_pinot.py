from unittest import mock

import pytest
from sqlalchemy import column


@pytest.mark.parametrize(
    "time_grain,expected_result",
    [
        ("PT1S", "CAST(DATE_TRUNC('second', CAST(col AS TIMESTAMP)) AS TIMESTAMP)"),
        (
            "PT5M",
            "CAST(ROUND(DATE_TRUNC('minute', CAST(col AS TIMESTAMP)), 300000) AS TIMESTAMP)",  # noqa: E501
        ),
        ("P1W", "CAST(DATE_TRUNC('week', CAST(col AS TIMESTAMP)) AS TIMESTAMP)"),
        ("P1M", "CAST(DATE_TRUNC('month', CAST(col AS TIMESTAMP)) AS TIMESTAMP)"),
        ("P3M", "CAST(DATE_TRUNC('quarter', CAST(col AS TIMESTAMP)) AS TIMESTAMP)"),
        ("P1Y", "CAST(DATE_TRUNC('year', CAST(col AS TIMESTAMP)) AS TIMESTAMP)"),
    ],
)
def test_timegrain_expressions(time_grain: str, expected_result: str) -> None:
    """
    DB Eng Specs (pinot): Test time grain expressions
    """
    from zobi.db_engine_specs.pinot import PinotEngineSpec as spec  # noqa: N813

    actual = str(
        spec.get_timestamp_expr(col=column("col"), pdf=None, time_grain=time_grain)
    )
    assert actual == expected_result


def test_extras_without_ssl() -> None:
    from zobi.db_engine_specs.pinot import PinotEngineSpec as spec  # noqa: N813
    from tests.integration_tests.fixtures.database import default_db_extra

    database = mock.Mock()
    database.extra = default_db_extra
    database.server_cert = None
    extras = spec.get_extra_params(database)
    assert "connect_args" not in extras["engine_params"]
