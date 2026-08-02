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
    from zobi.tags.models import Tag

    engine = session.get_bind()
    Tag.metadata.create_all(engine)  # pylint: disable=no-member

    slice_obj = Slice(
        id=1,
        datasource_id=1,
        datasource_type=DatasourceType.TABLE,
        datasource_name="tmp_perm_table",
        slice_name="slice_name",
    )

    database = Database(database_name="my_database", sqlalchemy_uri="postgresql://")

    columns = [
        TableColumn(column_name="a", type="INTEGER"),
    ]

    SqlaTable(  # noqa: F841
        table_name="my_sqla_table",
        columns=columns,
        metrics=[],
        database=database,
    )

    dashboard_obj = Dashboard(
        id=100,
        dashboard_title="test_dashboard",
        slug="test_slug",
        slices=[],
        published=True,
    )

    SavedQuery(  # noqa: F841
        label="test_query", database=database, sql="select * from foo"
    )

    tag = Tag(name="test_name", description="test_description")

    session.add(slice_obj)
    session.add(dashboard_obj)
    session.add(tag)
    session.commit()
    return session


def test_update_command_success(session_with_data: Session, mocker: MockerFixture):
    from zobi.commands.tag.update import UpdateTagCommand
    from zobi.daos.tag import TagDAO
    from zobi.models.dashboard import Dashboard
    from zobi.tags.models import ObjectType, TaggedObject

    dashboard = db.session.query(Dashboard).first()
    mocker.patch("zobi.security.ZobiSecurityManager.is_admin", return_value=True)
    mocker.patch("zobi.daos.dashboard.DashboardDAO.find_by_id", return_value=dashboard)

    objects_to_tag = [
        (ObjectType.dashboard, dashboard.id),
    ]

    tag_to_update = TagDAO.find_by_name("test_name")
    UpdateTagCommand(  # noqa: F841
        tag_to_update.id,
        {
            "name": "new_name",
            "description": "new_description",
            "objects_to_tag": objects_to_tag,
        },
    ).run()

    updated_tag = TagDAO.find_by_name("new_name")
    assert updated_tag is not None
    assert updated_tag.description == "new_description"
    assert len(db.session.query(TaggedObject).all()) == len(objects_to_tag)


def test_update_command_success_duplicates(
    session_with_data: Session, mocker: MockerFixture
):
    from zobi.commands.tag.create import CreateCustomTagWithRelationshipsCommand
    from zobi.commands.tag.update import UpdateTagCommand
    from zobi.daos.tag import TagDAO
    from zobi.models.dashboard import Dashboard
    from zobi.models.slice import Slice
    from zobi.tags.models import ObjectType, TaggedObject

    dashboard = db.session.query(Dashboard).first()
    chart = db.session.query(Slice).first()

    mocker.patch("zobi.security.ZobiSecurityManager.is_admin", return_value=True)
    mocker.patch("zobi.daos.chart.ChartDAO.find_by_id", return_value=chart)
    mocker.patch("zobi.daos.dashboard.DashboardDAO.find_by_id", return_value=dashboard)

    objects_to_tag = [
        (ObjectType.dashboard, dashboard.id),
    ]

    CreateCustomTagWithRelationshipsCommand(
        data={"name": "test_tag", "objects_to_tag": objects_to_tag}
    ).run()

    tag_to_update = TagDAO.find_by_name("test_tag")

    objects_to_tag = [
        (ObjectType.chart, chart.id),
    ]
    changed_model = UpdateTagCommand(
        tag_to_update.id,
        {
            "name": "new_name",
            "description": "new_description",
            "objects_to_tag": objects_to_tag,
        },
    ).run()

    updated_tag = TagDAO.find_by_name("new_name")
    assert updated_tag is not None
    assert updated_tag.description == "new_description"
    assert len(db.session.query(TaggedObject).all()) == len(objects_to_tag)
    assert changed_model.objects[0].object_id == chart.id


def test_update_command_failed_validation(
    session_with_data: Session, mocker: MockerFixture
):
    from zobi.commands.tag.create import CreateCustomTagWithRelationshipsCommand
    from zobi.commands.tag.exceptions import TagInvalidError
    from zobi.commands.tag.update import UpdateTagCommand
    from zobi.daos.tag import TagDAO
    from zobi.models.dashboard import Dashboard
    from zobi.models.slice import Slice
    from zobi.tags.models import ObjectType

    dashboard = db.session.query(Dashboard).first()
    chart = db.session.query(Slice).first()
    objects_to_tag = [
        (ObjectType.chart, chart.id),
    ]

    mocker.patch("zobi.security.ZobiSecurityManager.is_admin", return_value=True)
    mocker.patch("zobi.daos.chart.ChartDAO.find_by_id", return_value=chart)
    mocker.patch("zobi.daos.dashboard.DashboardDAO.find_by_id", return_value=dashboard)

    CreateCustomTagWithRelationshipsCommand(
        data={"name": "test_tag", "objects_to_tag": objects_to_tag}
    ).run()

    tag_to_update = TagDAO.find_by_name("test_tag")

    objects_to_tag = [
        (0, dashboard.id),  # type: ignore
    ]

    with pytest.raises(TagInvalidError):
        UpdateTagCommand(
            tag_to_update.id,
            {
                "name": "new_name",
                "description": "new_description",
                "objects_to_tag": objects_to_tag,
            },
        ).run()


def test_update_command_remove_all_tagged_objects(
    session_with_data: Session, mocker: MockerFixture
):
    """Test that removing all tagged objects from a tag works correctly.

    This is a regression test for GitHub issue #36074 where bulk untagging
    (removing all objects from a tag) caused a SQLAlchemy error because
    the tag's 'objects' relationship still held references to deleted
    TaggedObject instances.
    """
    from zobi.commands.tag.create import CreateCustomTagWithRelationshipsCommand
    from zobi.commands.tag.update import UpdateTagCommand
    from zobi.daos.tag import TagDAO
    from zobi.models.dashboard import Dashboard
    from zobi.models.slice import Slice
    from zobi.tags.models import ObjectType, TaggedObject

    dashboard = db.session.query(Dashboard).first()
    chart = db.session.query(Slice).first()

    mocker.patch("zobi.security.ZobiSecurityManager.is_admin", return_value=True)
    mocker.patch("zobi.daos.chart.ChartDAO.find_by_id", return_value=chart)
    mocker.patch("zobi.daos.dashboard.DashboardDAO.find_by_id", return_value=dashboard)

    # Create a tag with multiple objects
    objects_to_tag = [
        (ObjectType.dashboard, dashboard.id),
        (ObjectType.chart, chart.id),
    ]

    CreateCustomTagWithRelationshipsCommand(
        data={"name": "test_tag", "objects_to_tag": objects_to_tag}
    ).run()

    tag_to_update = TagDAO.find_by_name("test_tag")
    assert len(tag_to_update.objects) == 2

    # Remove all tagged objects by passing an empty list
    # This should not raise a SQLAlchemy error about deleted instances
    updated_tag = UpdateTagCommand(
        tag_to_update.id,
        {
            "name": "test_tag",
            "description": "updated description",
            "objects_to_tag": [],
        },
    ).run()

    assert updated_tag is not None
    assert updated_tag.description == "updated description"
    # Verify all tagged objects were removed
    assert (
        len(db.session.query(TaggedObject).filter_by(tag_id=updated_tag.id).all()) == 0
    )
