from datetime import datetime
from typing import Optional

import pytest

from tests.unit_tests.db_engine_specs.utils import assert_convert_dttm
from tests.unit_tests.fixtures.common import dttm  # noqa: F401


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("Date", "CAST('2019-01-02' AS DATE)"),
        (
            "DateTime",
            "CAST('2019-01-02T03:04:05' AS DATETIME)",
        ),
        (
            "TimeStamp",
            "CAST('2019-01-02T03:04:05' AS TIMESTAMP)",
        ),
        ("UnknownType", None),
    ],
)
def test_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    from zobi.db_engine_specs.firebolt import (
        FireboltEngineSpec as spec,  # noqa: N813
    )

    assert_convert_dttm(spec, target_type, expected_result, dttm)


def test_epoch_to_dttm() -> None:
    from zobi.db_engine_specs.firebolt import FireboltEngineSpec

    assert (
        FireboltEngineSpec.epoch_to_dttm().format(col="timestamp_column")
        == "from_unixtime(timestamp_column)"
    )
