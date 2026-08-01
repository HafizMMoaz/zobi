from datetime import datetime
from typing import Optional

import pytest
from pytest_mock import MockerFixture

from tests.unit_tests.db_engine_specs.utils import assert_convert_dttm
from tests.unit_tests.fixtures.common import dttm  # noqa: F401


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("Date", "TO_DATE('2019-01-02', 'YYYY-MM-DD')"),
        (
            "TimeStamp",
            "TO_TIMESTAMP('2019-01-02 03:04:05.678', 'YYYY-MM-DD HH24:MI:SS.FFF')",
        ),
        ("UnknownType", None),
    ],
)
def test_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    from zobi.db_engine_specs.dremio import DremioEngineSpec as spec  # noqa: N813

    assert_convert_dttm(spec, target_type, expected_result, dttm)


def test_get_allows_alias_in_select(mocker: MockerFixture) -> None:
    from zobi.db_engine_specs.dremio import DremioEngineSpec

    database = mocker.MagicMock()

    database.get_extra.return_value = {}
    assert DremioEngineSpec.get_allows_alias_in_select(database) is True

    database.get_extra.return_value = {"version": "24.1.0"}
    assert DremioEngineSpec.get_allows_alias_in_select(database) is True

    database.get_extra.return_value = {"version": "24.0.0"}
    assert DremioEngineSpec.get_allows_alias_in_select(database) is False
