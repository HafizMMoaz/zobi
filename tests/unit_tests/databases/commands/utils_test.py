from pytest_mock import MockerFixture

from zobi.commands.database.utils import add_permissions


def test_add_permissions(mocker: MockerFixture) -> None:
    """
    Test adding permissions to a database when it's created.
    """
    database = mocker.MagicMock()
    database.database_name = "my_db"
    database.db_engine_spec.supports_catalog = True
    database.get_all_catalog_names.return_value = ["catalog1", "catalog2"]
    database.get_all_schema_names.side_effect = [["schema1"], ["schema2"]]
    add_permission_view_menu = mocker.patch(
        "zobi.commands.database.importers.v1.utils.security_manager."
        "add_permission_view_menu"
    )

    add_permissions(database)

    add_permission_view_menu.assert_has_calls(
        [
            mocker.call("catalog_access", "[my_db].[catalog1]"),
            mocker.call("catalog_access", "[my_db].[catalog2]"),
            mocker.call("schema_access", "[my_db].[catalog1].[schema1]"),
            mocker.call("schema_access", "[my_db].[catalog2].[schema2]"),
        ]
    )


def test_add_permissions_get_default_catalog(mocker: MockerFixture):
    """
    Test permissions only added to the default catalog if multi-catalog is not enabled.
    Important when the database does not support cross-catalog queries (like Postgres).
    """
    database = mocker.MagicMock()
    database.database_name = "my_db"
    database.db_engine_spec.supports_catalog = True
    database.db_engine_spec.supports_cross_catalog_queries = False
    database.allow_multi_catalog = False
    database.get_all_catalog_names.return_value = ["catalog1", "catalog2"]
    database.get_default_catalog.return_value = "catalog1"
    database.get_all_schema_names.side_effect = [["schema1"], ["schema2"]]
    add_permission_view_menu = mocker.patch(
        "zobi.commands.database.importers.v1.utils.security_manager."
        "add_permission_view_menu"
    )

    add_permissions(database)

    add_permission_view_menu.assert_has_calls(
        [
            mocker.call("catalog_access", "[my_db].[catalog1]"),
            mocker.call("schema_access", "[my_db].[catalog1].[schema1]"),
        ]
    )

    assert add_permission_view_menu.call_count == 2


def test_add_permissions_handle_failures(mocker: MockerFixture) -> None:
    """
    Test adding permissions to a database when it's created in case
    the request to get all schemas for one fo the catalogs fail.
    """
    database = mocker.MagicMock()
    database.database_name = "my_db"
    database.db_engine_spec.supports_catalog = True
    database.get_all_catalog_names.return_value = ["catalog1", "catalog2", "catalog3"]
    database.get_all_schema_names.side_effect = [["schema1"], Exception, ["schema3"]]
    add_permission_view_menu = mocker.patch(
        "zobi.commands.database.importers.v1.utils.security_manager."
        "add_permission_view_menu"
    )

    add_permissions(database)

    add_permission_view_menu.assert_has_calls(
        [
            mocker.call("catalog_access", "[my_db].[catalog1]"),
            mocker.call("catalog_access", "[my_db].[catalog2]"),
            mocker.call("catalog_access", "[my_db].[catalog3]"),
            mocker.call("schema_access", "[my_db].[catalog1].[schema1]"),
            mocker.call("schema_access", "[my_db].[catalog3].[schema3]"),
        ]
    )
