from datetime import datetime
from typing import Optional

import pytest

from tests.unit_tests.db_engine_specs.utils import assert_convert_dttm
from tests.unit_tests.fixtures.common import dttm  # noqa: F401


def test_epoch_to_dttm() -> None:
    """
    DB Eng Specs (parseable): Test epoch to dttm
    """
    from zobi.db_engine_specs.parseable import ParseableEngineSpec

    assert ParseableEngineSpec.epoch_to_dttm() == "to_timestamp({col})"


def test_epoch_ms_to_dttm() -> None:
    """
    DB Eng Specs (parseable): Test epoch ms to dttm
    """
    from zobi.db_engine_specs.parseable import ParseableEngineSpec

    assert ParseableEngineSpec.epoch_ms_to_dttm() == "to_timestamp({col} / 1000)"


def test_alter_new_orm_column() -> None:
    """
    DB Eng Specs (parseable): Test alter orm column
    """
    from zobi.connectors.sqla.models import SqlaTable, TableColumn
    from zobi.db_engine_specs.parseable import ParseableEngineSpec
    from zobi.models.core import Database

    database = Database(database_name="parseable", sqlalchemy_uri="parseable://db")
    tbl = SqlaTable(table_name="tbl", database=database)
    col = TableColumn(column_name="p_timestamp", type="TIMESTAMP", table=tbl)
    ParseableEngineSpec.alter_new_orm_column(col)
    assert col.python_date_format == "epoch_ms"
    assert col.is_dttm is True


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("TIMESTAMP", "'2019-01-02T03:04:05.000'"),
        ("UnknownType", None),
    ],
)
def test_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    """
    DB Eng Specs (parseable): Test conversion to date time
    """
    from zobi.db_engine_specs.parseable import ParseableEngineSpec

    assert_convert_dttm(ParseableEngineSpec, target_type, expected_result, dttm)
