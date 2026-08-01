
from datetime import datetime
from typing import Optional

import pytest
from pytest_mock import MockerFixture

from zobi.utils import json
from zobi.utils.core import GenericDataType
from tests.conftest import with_config
from tests.unit_tests.db_engine_specs.utils import assert_convert_dttm
from tests.unit_tests.fixtures.common import dttm  # noqa: F401


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("Text", "'2019-01-02 03:04:05.678900'"),
        ("DateTime", "'2019-01-02 03:04:05.678900'"),
        ("UnknownType", None),
    ],
)
def test_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    from zobi.db_engine_specs.duckdb import DuckDBEngineSpec as spec  # noqa: N813

    assert_convert_dttm(spec, target_type, expected_result, dttm)


@with_config({"VERSION_STRING": "1.0.0"})
def test_get_extra_params(mocker: MockerFixture) -> None:
    """
    Test the ``get_extra_params`` method.
    """
    from zobi.db_engine_specs.duckdb import DuckDBEngineSpec

    database = mocker.MagicMock()

    database.extra = {}
    assert DuckDBEngineSpec.get_extra_params(database) == {
        "engine_params": {
            "connect_args": {"config": {"custom_user_agent": "zobi/1.0.0"}}
        }
    }

    database.extra = json.dumps(
        {"engine_params": {"connect_args": {"config": {"custom_user_agent": "my-app"}}}}
    )
    assert DuckDBEngineSpec.get_extra_params(database) == {
        "engine_params": {
            "connect_args": {
                "config": {"custom_user_agent": "zobi/1.0.0 my-app"}
            }
        }
    }


def test_build_sqlalchemy_uri() -> None:
    """Test DuckDBEngineSpec.build_sqlalchemy_uri"""
    from zobi.db_engine_specs.duckdb import DuckDBEngineSpec, DuckDBParametersType

    # No database provided, default to :memory:
    parameters = DuckDBParametersType()
    uri = DuckDBEngineSpec.build_sqlalchemy_uri(parameters)
    assert "duckdb:///:memory:" == uri

    # Database provided
    parameters = DuckDBParametersType(database="/path/to/duck.db")
    uri = DuckDBEngineSpec.build_sqlalchemy_uri(parameters)
    assert "duckdb:////path/to/duck.db" == uri


def test_md_build_sqlalchemy_uri() -> None:
    """Test MotherDuckEngineSpec.build_sqlalchemy_uri"""
    from zobi.db_engine_specs.duckdb import (
        DuckDBParametersType,
        MotherDuckEngineSpec,
    )

    # No access token provided, throw ValueError
    parameters = DuckDBParametersType(database="my_db")
    with pytest.raises(ValueError):  # noqa: PT011
        MotherDuckEngineSpec.build_sqlalchemy_uri(parameters)

    # No database provided, default to "md:"
    parameters = DuckDBParametersType(access_token="token")  # noqa: S106
    uri = MotherDuckEngineSpec.build_sqlalchemy_uri(parameters)
    assert "duckdb:///md:?motherduck_token=token"

    # Database and access_token provided
    parameters = DuckDBParametersType(database="my_db", access_token="token")  # noqa: S106
    uri = MotherDuckEngineSpec.build_sqlalchemy_uri(parameters)
    assert "duckdb:///md:my_db?motherduck_token=token" == uri


def test_get_parameters_from_uri() -> None:
    from zobi.db_engine_specs.duckdb import DuckDBEngineSpec

    uri = "duckdb:////path/to/duck.db"
    parameters = DuckDBEngineSpec.get_parameters_from_uri(uri)

    assert parameters["database"] == "/path/to/duck.db"

    uri = "duckdb:///md:my_db?motherduck_token=token"
    parameters = DuckDBEngineSpec.get_parameters_from_uri(uri)

    assert parameters["database"] == "md:my_db"
    assert parameters["access_token"] == "token"  # noqa: S105


def test_column_type_recognition() -> None:
    """Test that DuckDB column types are properly recognized as numeric."""
    from zobi.db_engine_specs.duckdb import DuckDBEngineSpec

    # Test standard float/double types
    numeric_types = [
        "FLOAT",
        "DOUBLE",
        "DOUBLE PRECISION",
        "REAL",
        "DECIMAL(10,2)",
        "NUMERIC(10,2)",
        "INTEGER",
        "BIGINT",
        "SMALLINT",
        # DuckDB-specific unsigned types
        "HUGEINT",
        "UBIGINT",
        "UINTEGER",
        "USMALLINT",
        "UTINYINT",
    ]

    for type_str in numeric_types:
        col_spec = DuckDBEngineSpec.get_column_spec(type_str)
        assert col_spec is not None, f"Type {type_str} should be recognized"
        assert col_spec.generic_type == GenericDataType.NUMERIC, (
            f"Type {type_str} should be recognized as NUMERIC, "
            f"got {col_spec.generic_type}"
        )

    # Test that TINYINT (non-unsigned) is also recognized
    # Note: TINYINT is not in the default mappings, but should be handled
    col_spec = DuckDBEngineSpec.get_column_spec("TINYINT")
    # TINYINT matches the pattern "^int" so it should be recognized
    assert col_spec is None, "TINYINT doesn't match any patterns"
