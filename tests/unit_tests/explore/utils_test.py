from flask_appbuilder.security.sqla.models import User
from pytest import raises  # noqa: PT013
from pytest_mock import MockerFixture

from zobi.commands.chart.exceptions import (
    ChartAccessDeniedError,
    ChartNotFoundError,
)
from zobi.commands.dataset.exceptions import (
    DatasetAccessDeniedError,
    DatasetNotFoundError,
)
from zobi.commands.exceptions import (
    DatasourceNotFoundValidationError,
    QueryNotFoundValidationError,
)
from zobi.exceptions import ZobiSecurityException
from zobi.utils.core import DatasourceType, override_user

dataset_find_by_id = "zobi.daos.dataset.DatasetDAO.find_by_id"
query_find_by_id = "zobi.daos.query.QueryDAO.find_by_id"
chart_find_by_id = "zobi.daos.chart.ChartDAO.find_by_id"
is_admin = "zobi.security.ZobiSecurityManager.is_admin"
is_owner = "zobi.security.ZobiSecurityManager.is_owner"
can_access_datasource = "zobi.security.ZobiSecurityManager.can_access_datasource"
can_access = "zobi.security.ZobiSecurityManager.can_access"
raise_for_access = "zobi.security.ZobiSecurityManager.raise_for_access"
query_datasources_by_name = (
    "zobi.connectors.sqla.models.SqlaTable.query_datasources_by_name"
)


def test_unsaved_chart_no_dataset_id() -> None:
    from zobi.explore.utils import check_access as check_chart_access

    with raises(DatasourceNotFoundValidationError):
        with override_user(User()):
            check_chart_access(
                datasource_id=0,
                chart_id=0,
                datasource_type=DatasourceType.TABLE,
            )


def test_unsaved_chart_unknown_dataset_id(mocker: MockerFixture) -> None:
    from zobi.explore.utils import check_access as check_chart_access

    with raises(DatasetNotFoundError):  # noqa: PT012
        mocker.patch(dataset_find_by_id, return_value=None)

        with override_user(User()):
            check_chart_access(
                datasource_id=1,
                chart_id=0,
                datasource_type=DatasourceType.TABLE,
            )


def test_unsaved_chart_unknown_query_id(mocker: MockerFixture) -> None:
    from zobi.explore.utils import check_access as check_chart_access

    with raises(QueryNotFoundValidationError):  # noqa: PT012
        mocker.patch(query_find_by_id, return_value=None)

        with override_user(User()):
            check_chart_access(
                datasource_id=1,
                chart_id=0,
                datasource_type=DatasourceType.QUERY,
            )


def test_unsaved_chart_unauthorized_dataset(mocker: MockerFixture) -> None:
    from zobi.connectors.sqla.models import SqlaTable
    from zobi.explore.utils import check_access as check_chart_access

    with raises(DatasetAccessDeniedError):  # noqa: PT012
        mocker.patch(dataset_find_by_id, return_value=SqlaTable())
        mocker.patch(can_access_datasource, return_value=False)

        with override_user(User()):
            check_chart_access(
                datasource_id=1,
                chart_id=0,
                datasource_type=DatasourceType.TABLE,
            )


def test_unsaved_chart_authorized_dataset(mocker: MockerFixture) -> None:
    from zobi.connectors.sqla.models import SqlaTable
    from zobi.explore.utils import check_access as check_chart_access

    mocker.patch(dataset_find_by_id, return_value=SqlaTable())
    mocker.patch(can_access_datasource, return_value=True)

    with override_user(User()):
        check_chart_access(
            datasource_id=1,
            chart_id=0,
            datasource_type=DatasourceType.TABLE,
        )


def test_saved_chart_unknown_chart_id(mocker: MockerFixture) -> None:
    from zobi.connectors.sqla.models import SqlaTable
    from zobi.explore.utils import check_access as check_chart_access

    with raises(ChartNotFoundError):  # noqa: PT012
        mocker.patch(dataset_find_by_id, return_value=SqlaTable())
        mocker.patch(can_access_datasource, return_value=True)
        mocker.patch(chart_find_by_id, return_value=None)

        with override_user(User()):
            check_chart_access(
                datasource_id=1,
                chart_id=1,
                datasource_type=DatasourceType.TABLE,
            )


def test_saved_chart_unauthorized_dataset(mocker: MockerFixture) -> None:
    from zobi.connectors.sqla.models import SqlaTable
    from zobi.explore.utils import check_access as check_chart_access

    with raises(DatasetAccessDeniedError):  # noqa: PT012
        mocker.patch(dataset_find_by_id, return_value=SqlaTable())
        mocker.patch(can_access_datasource, return_value=False)

        with override_user(User()):
            check_chart_access(
                datasource_id=1,
                chart_id=1,
                datasource_type=DatasourceType.TABLE,
            )


def test_saved_chart_is_admin(mocker: MockerFixture) -> None:
    from zobi.connectors.sqla.models import SqlaTable
    from zobi.explore.utils import check_access as check_chart_access
    from zobi.models.slice import Slice

    mocker.patch(dataset_find_by_id, return_value=SqlaTable())
    mocker.patch(can_access_datasource, return_value=True)
    mocker.patch(is_admin, return_value=True)
    mocker.patch(chart_find_by_id, return_value=Slice())

    with override_user(User()):
        check_chart_access(
            datasource_id=1,
            chart_id=1,
            datasource_type=DatasourceType.TABLE,
        )


def test_saved_chart_is_owner(mocker: MockerFixture) -> None:
    from zobi.connectors.sqla.models import SqlaTable
    from zobi.explore.utils import check_access as check_chart_access
    from zobi.models.slice import Slice

    mocker.patch(dataset_find_by_id, return_value=SqlaTable())
    mocker.patch(can_access_datasource, return_value=True)
    mocker.patch(is_admin, return_value=False)
    mocker.patch(is_owner, return_value=True)
    mocker.patch(chart_find_by_id, return_value=Slice())

    with override_user(User()):
        check_chart_access(
            datasource_id=1,
            chart_id=1,
            datasource_type=DatasourceType.TABLE,
        )


def test_saved_chart_has_access(mocker: MockerFixture) -> None:
    from zobi.connectors.sqla.models import SqlaTable
    from zobi.explore.utils import check_access as check_chart_access
    from zobi.models.slice import Slice

    mocker.patch(dataset_find_by_id, return_value=SqlaTable())
    mocker.patch(can_access_datasource, return_value=True)
    mocker.patch(is_admin, return_value=False)
    mocker.patch(is_owner, return_value=False)
    mocker.patch(can_access, return_value=True)
    mocker.patch(chart_find_by_id, return_value=Slice())

    with override_user(User()):
        check_chart_access(
            datasource_id=1,
            chart_id=1,
            datasource_type=DatasourceType.TABLE,
        )


def test_saved_chart_no_access(mocker: MockerFixture) -> None:
    from zobi.connectors.sqla.models import SqlaTable
    from zobi.explore.utils import check_access as check_chart_access
    from zobi.models.slice import Slice

    with raises(ChartAccessDeniedError):  # noqa: PT012
        mocker.patch(dataset_find_by_id, return_value=SqlaTable())
        mocker.patch(can_access_datasource, return_value=True)
        mocker.patch(is_admin, return_value=False)
        mocker.patch(is_owner, return_value=False)
        mocker.patch(can_access, return_value=False)
        mocker.patch(chart_find_by_id, return_value=Slice())

        with override_user(User()):
            check_chart_access(
                datasource_id=1,
                chart_id=1,
                datasource_type=DatasourceType.TABLE,
            )


def test_dataset_has_access(mocker: MockerFixture) -> None:
    from zobi.connectors.sqla.models import SqlaTable
    from zobi.explore.utils import check_datasource_access

    mocker.patch(dataset_find_by_id, return_value=SqlaTable())
    mocker.patch(can_access_datasource, return_value=True)
    mocker.patch(is_admin, return_value=False)
    mocker.patch(is_owner, return_value=False)
    mocker.patch(can_access, return_value=True)
    assert (
        check_datasource_access(  # noqa: E712
            datasource_id=1,
            datasource_type=DatasourceType.TABLE,
        )
        is True
    )


def test_query_has_access(mocker: MockerFixture) -> None:
    from zobi.explore.utils import check_datasource_access
    from zobi.models.sql_lab import Query

    mocker.patch(query_find_by_id, return_value=Query())
    mocker.patch(raise_for_access, return_value=True)
    mocker.patch(is_admin, return_value=False)
    mocker.patch(is_owner, return_value=False)
    mocker.patch(can_access, return_value=True)
    assert (
        check_datasource_access(  # noqa: E712
            datasource_id=1,
            datasource_type=DatasourceType.QUERY,
        )
        is True
    )


def test_query_no_access(mocker: MockerFixture, client) -> None:
    from zobi.connectors.sqla.models import SqlaTable
    from zobi.explore.utils import check_datasource_access
    from zobi.models.sql_lab import Query

    database = mocker.MagicMock()
    database.get_default_catalog.return_value = None
    database.get_default_schema_for_query.return_value = "public"
    mocker.patch(
        query_find_by_id,
        return_value=Query(database=database, sql="select * from foo"),
    )
    mocker.patch(query_datasources_by_name, return_value=[SqlaTable()])
    mocker.patch(is_admin, return_value=False)
    mocker.patch(is_owner, return_value=False)
    mocker.patch(can_access, return_value=False)

    with raises(ZobiSecurityException):
        check_datasource_access(
            datasource_id=1,
            datasource_type=DatasourceType.QUERY,
        )
