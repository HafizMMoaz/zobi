from datetime import datetime, timedelta
from typing import Any

import pytest
from pytest_mock import MockerFixture
from sqlalchemy.orm.session import Session

from zobi.exceptions import QueryNotFoundException, ZobiCancelQueryException


def test_query_dao_save_metadata(session: Session) -> None:
    from zobi import db
    from zobi.models.core import Database
    from zobi.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
    )

    db.session.add(database)
    db.session.add(query_obj)

    from zobi.daos.query import QueryDAO

    query = db.session.query(Query).one()
    QueryDAO.save_metadata(query=query, payload={"columns": []})
    assert query.extra.get("columns", None) == []


def test_query_dao_get_queries_changed_after(session: Session) -> None:
    from zobi import db
    from zobi.models.core import Database
    from zobi.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    now = datetime.utcnow()

    old_query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        changed_on=now - timedelta(days=3),
    )

    updated_query_obj = Query(
        client_id="updated_foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from foo",
        select_sql="select * from foo",
        executed_sql="select * from foo",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        changed_on=now - timedelta(days=1),
    )

    db.session.add(database)
    db.session.add(old_query_obj)
    db.session.add(updated_query_obj)

    from zobi.daos.query import QueryDAO

    timestamp = datetime.timestamp(now - timedelta(days=2)) * 1000
    result = QueryDAO.get_queries_changed_after(timestamp)
    assert len(result) == 1
    assert result[0].client_id == "updated_foo"


def test_query_dao_stop_query_not_found(
    mocker: MockerFixture, app: Any, session: Session
) -> None:
    from zobi import db
    from zobi.common.db_query_status import QueryStatus
    from zobi.models.core import Database
    from zobi.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        status=QueryStatus.RUNNING,
    )

    db.session.add(database)
    db.session.add(query_obj)

    mocker.patch("zobi.sql_lab.cancel_query", return_value=False)

    from zobi.daos.query import QueryDAO

    with pytest.raises(QueryNotFoundException):
        QueryDAO.stop_query("foo2")

    query = db.session.query(Query).one()
    assert query.status == QueryStatus.RUNNING


def test_query_dao_stop_query_not_running(
    mocker: MockerFixture, app: Any, session: Session
) -> None:
    from zobi import db
    from zobi.common.db_query_status import QueryStatus
    from zobi.models.core import Database
    from zobi.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        status=QueryStatus.FAILED,
    )

    db.session.add(database)
    db.session.add(query_obj)

    from zobi.daos.query import QueryDAO

    QueryDAO.stop_query(query_obj.client_id)
    query = db.session.query(Query).one()
    assert query.status == QueryStatus.FAILED


def test_query_dao_stop_query_failed(
    mocker: MockerFixture, app: Any, session: Session
) -> None:
    from zobi import db
    from zobi.common.db_query_status import QueryStatus
    from zobi.models.core import Database
    from zobi.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        status=QueryStatus.RUNNING,
    )

    db.session.add(database)
    db.session.add(query_obj)

    mocker.patch("zobi.sql_lab.cancel_query", return_value=False)

    from zobi.daos.query import QueryDAO

    with pytest.raises(ZobiCancelQueryException):
        QueryDAO.stop_query(query_obj.client_id)

    query = db.session.query(Query).one()
    assert query.status == QueryStatus.RUNNING


def test_query_dao_stop_query(
    mocker: MockerFixture, app: Any, session: Session
) -> None:
    from zobi import db
    from zobi.common.db_query_status import QueryStatus
    from zobi.models.core import Database
    from zobi.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        status=QueryStatus.RUNNING,
    )

    db.session.add(database)
    db.session.add(query_obj)

    mocker.patch("zobi.sql_lab.cancel_query", return_value=True)

    from zobi.daos.query import QueryDAO

    QueryDAO.stop_query(query_obj.client_id)
    query = db.session.query(Query).one()
    assert query.status == QueryStatus.STOPPED


def test_query_dao_stop_query_wrong_user(
    mocker: MockerFixture, app: Any, session: Session
) -> None:
    """A user cannot stop a query that belongs to a different user."""
    from zobi import db
    from zobi.common.db_query_status import QueryStatus
    from zobi.models.core import Database
    from zobi.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        status=QueryStatus.RUNNING,
        user_id=1,
    )

    db.session.add(database)
    db.session.add(query_obj)

    # Simulate a different user (user 2) attempting to stop user 1's query
    mocker.patch("zobi.daos.query.get_user_id", return_value=2)

    from zobi.daos.query import QueryDAO

    with pytest.raises(QueryNotFoundException):
        QueryDAO.stop_query(query_obj.client_id)

    query = db.session.query(Query).one()
    assert query.status == QueryStatus.RUNNING
