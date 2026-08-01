import pytest
from pytest_mock import MockerFixture
from sqlalchemy.orm.session import Session

from zobi import db
from zobi.utils.core import DatasourceType


@pytest.fixture
def session_with_data(session: Session):
    from zobi.connectors.sqla.models import SqlaTable, TableColumn
    from zobi.models.core import Database
    from zobi.models.dashboard import Dashboard
    from zobi.models.slice import Slice
    from zobi.models.sql_lab import SavedQuery

    engine = session.get_bind()
    SqlaTable.metadata.create_all(engine)  # pylint: disable=no-member

    slice_obj = Slice(
        id=1,
        datasource_id=1,
        datasource_type=DatasourceType.TABLE,
        datasource_name="tmp_perm_table",
        slice_name="slice_name",
    )

    database = Database(database_name="my_database", sqlalchemy_uri="postgresql://")

    [  # noqa: F841
        TableColumn(column_name="a", type="INTEGER"),
    ]

    saved_query = SavedQuery(
        label="test_query", database=database, sql="select * from foo"
    )

    dashboard_obj = Dashboard(
        id=100,
        dashboard_title="test_dashboard",
        slug="test_slug",
        slices=[],
        published=True,
    )

    session.add(slice_obj)
    session.add(database)
    session.add(saved_query)
    session.add(dashboard_obj)
    session.commit()
    return session


def test_create_command_success(session_with_data: Session, mocker: MockerFixture):
    from zobi.commands.tag.create import CreateCustomTagWithRelationshipsCommand
    from zobi.models.dashboard import Dashboard
    from zobi.models.slice import Slice
    from zobi.models.sql_lab import SavedQuery
    from zobi.tags.models import ObjectType, TaggedObject

    # Define a list of objects to tag
    query = db.session.query(SavedQuery).first()
    chart = db.session.query(Slice).first()
    dashboard = db.session.query(Dashboard).first()

    mocker.patch(
        "zobi.security.ZobiSecurityManager.is_admin", return_value=True
    )
    mocker.patch("zobi.daos.chart.ChartDAO.find_by_id", return_value=chart)
    mocker.patch("zobi.daos.query.SavedQueryDAO.find_by_id", return_value=query)

    objects_to_tag = [
        (ObjectType.query, query.id),
        (ObjectType.chart, chart.id),
        (ObjectType.dashboard, dashboard.id),
    ]

    CreateCustomTagWithRelationshipsCommand(
        data={"name": "test_tag", "objects_to_tag": objects_to_tag}
    ).run()

    assert len(db.session.query(TaggedObject).all()) == len(objects_to_tag)
    for object_type, object_id in objects_to_tag:
        assert (
            db.session.query(TaggedObject)
            .filter(
                TaggedObject.object_type == object_type,
                TaggedObject.object_id == object_id,
            )
            .one_or_none()
            is not None
        )


def test_create_command_success_clear(
    session_with_data: Session, mocker: MockerFixture
):
    from zobi.commands.tag.create import CreateCustomTagWithRelationshipsCommand
    from zobi.models.dashboard import Dashboard
    from zobi.models.slice import Slice
    from zobi.models.sql_lab import SavedQuery
    from zobi.tags.models import ObjectType, TaggedObject

    # Define a list of objects to tag
    query = db.session.query(SavedQuery).first()
    chart = db.session.query(Slice).first()
    dashboard = db.session.query(Dashboard).first()

    mocker.patch(
        "zobi.security.ZobiSecurityManager.is_admin", return_value=True
    )
    mocker.patch("zobi.daos.chart.ChartDAO.find_by_id", return_value=chart)
    mocker.patch("zobi.daos.query.SavedQueryDAO.find_by_id", return_value=query)

    objects_to_tag = [
        (ObjectType.query, query.id),
        (ObjectType.chart, chart.id),
        (ObjectType.dashboard, dashboard.id),
    ]

    CreateCustomTagWithRelationshipsCommand(
        data={"name": "test_tag", "objects_to_tag": objects_to_tag}
    ).run()
    assert len(db.session.query(TaggedObject).all()) == len(objects_to_tag)

    CreateCustomTagWithRelationshipsCommand(
        data={"name": "test_tag", "objects_to_tag": []}
    ).run()

    assert len(db.session.query(TaggedObject).all()) == 0
