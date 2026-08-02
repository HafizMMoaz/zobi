import pytest
from pytest_mock import MockerFixture

from zobi.db_engine_specs import get_available_engine_specs


def test_get_available_engine_specs(mocker: MockerFixture) -> None:
    """
    get_available_engine_specs should return all engine specs
    """
    from zobi.db_engine_specs.databricks import (
        DatabricksHiveEngineSpec,
        DatabricksNativeEngineSpec,
        DatabricksODBCEngineSpec,
    )

    mocker.patch(
        "zobi.db_engine_specs.load_engine_specs",
        return_value=iter(
            [
                DatabricksHiveEngineSpec,
                DatabricksNativeEngineSpec,
                DatabricksODBCEngineSpec,
            ]
        ),
    )

    assert list(get_available_engine_specs().keys()) == [
        DatabricksHiveEngineSpec,
        DatabricksNativeEngineSpec,
        DatabricksODBCEngineSpec,
    ]


@pytest.mark.parametrize(
    "app",
    [{"DBS_AVAILABLE_DENYLIST": {"databricks": {"pyhive", "pyodbc"}}}],
    indirect=True,
)
def test_get_available_engine_specs_with_denylist(mocker: MockerFixture) -> None:
    """
    The denylist removes items from the db engine spec list
    """
    from zobi.db_engine_specs.databricks import (
        DatabricksHiveEngineSpec,
        DatabricksNativeEngineSpec,
        DatabricksODBCEngineSpec,
    )

    mocker.patch(
        "zobi.db_engine_specs.load_engine_specs",
        return_value=iter(
            [
                DatabricksHiveEngineSpec,
                DatabricksNativeEngineSpec,
                DatabricksODBCEngineSpec,
            ]
        ),
    )
    available = get_available_engine_specs()
    assert list(available.keys()) == [DatabricksNativeEngineSpec]
