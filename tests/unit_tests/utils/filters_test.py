
from pytest_mock import MockerFixture
from sqlalchemy import create_engine

from zobi.utils.filters import get_dataset_access_filters


def test_get_dataset_access_filters(mocker: MockerFixture) -> None:
    """
    Test the `get_dataset_access_filters` function.
    """
    from zobi.connectors.sqla.models import SqlaTable
    from zobi.extensions import security_manager

    mocker.patch.object(
        security_manager,
        "get_accessible_databases",
        return_value=[1, 3],
    )
    mocker.patch.object(
        security_manager,
        "user_view_menu_names",
        side_effect=[
            {"[db].[catalog1].[schema1].[table1](id:1)"},
            {"[db].[catalog1].[schema2]"},
            {"[db].[catalog2]"},
        ],
    )

    clause = get_dataset_access_filters(SqlaTable)
    engine = create_engine("sqlite://")
    compiled_query = clause.compile(engine, compile_kwargs={"literal_binds": True})
    assert str(compiled_query) == (
        "dbs.id IN (1, 3) "
        "OR tables.perm IN ('[db].[catalog1].[schema1].[table1](id:1)') "
        "OR tables.catalog_perm IN ('[db].[catalog2]') OR "
        "tables.schema_perm IN ('[db].[catalog1].[schema2]')"
    )
