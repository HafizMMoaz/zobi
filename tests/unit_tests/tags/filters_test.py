import pytest
from flask_appbuilder import Model
from flask_appbuilder.models.sqla.interface import SQLAInterface
from sqlalchemy.orm.session import Session

from zobi.models.dashboard import Dashboard
from zobi.models.slice import Slice
from zobi.models.sql_lab import SavedQuery
from zobi.tags.filters import BaseTagIdFilter, BaseTagNameFilter

FILTER_MODELS = [Slice, Dashboard, SavedQuery]
OBJECT_TYPES = {
    "dashboards": "dashboard",
    "slices": "chart",
    "saved_query": "query",
}


@pytest.mark.parametrize("model", FILTER_MODELS)
@pytest.mark.parametrize("name", ["my_tag", "test tag", "blaah"])
def test_base_tag_filter_by_name(session: Session, model: Model, name: str) -> None:
    table = model.__tablename__
    engine = session.get_bind()
    query = session.query(model)
    filter = BaseTagNameFilter("tags", SQLAInterface(model))
    final_query = filter.apply(query, name)
    compiled_query = final_query.statement.compile(
        engine,
        compile_kwargs={"literal_binds": True},
    )

    # Assert the JOIN clause is correct
    assert (
        f"FROM {table} JOIN tagged_object AS tagged_object_1 ON {table}.id "
        "= tagged_object_1.object_id AND tagged_object_1.object_type = "
        f"'{OBJECT_TYPES.get(table)}' JOIN tag ON tagged_object_1.tag_id = tag.id"
    ) in str(compiled_query)

    # Assert the WHERE clause is correct
    assert str(compiled_query).endswith(
        f"WHERE lower(tag.name) LIKE lower('%{name}%'))"
    )


@pytest.mark.parametrize("model", FILTER_MODELS)
@pytest.mark.parametrize("id", [3, 5, 8])
def test_base_tag_filter_by_id(session: Session, model: Model, id: int) -> None:
    table = model.__tablename__
    engine = session.get_bind()
    query = session.query(model)

    filter = BaseTagIdFilter("tags", SQLAInterface(model))
    filter.id_based_filter = True
    final_query = filter.apply(query, id)
    compiled_query = final_query.statement.compile(
        engine,
        compile_kwargs={"literal_binds": True},
    )

    # Assert the JOIN clause is correct
    assert (
        f"FROM {table} JOIN tagged_object AS tagged_object_1 ON {table}.id "
        "= tagged_object_1.object_id AND tagged_object_1.object_type = "
        f"'{OBJECT_TYPES.get(table)}' JOIN tag ON tagged_object_1.tag_id = tag.id"
    ) in str(compiled_query)

    # Assert the WHERE clause is correct
    assert str(compiled_query).endswith(f"WHERE tag.id = {id})")
