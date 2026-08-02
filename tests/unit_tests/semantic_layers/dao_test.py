"""Tests for SemanticViewDAO."""

from __future__ import annotations

import uuid
from collections.abc import Iterator

import pytest
from sqlalchemy.orm.session import Session


@pytest.fixture
def session_with_semantic_view(session: Session) -> Iterator[Session]:
    """Create an in-memory DB with a SemanticLayer and one SemanticView."""
    from zobi.semantic_layers.models import SemanticLayer, SemanticView

    engine = session.get_bind()
    SemanticView.metadata.create_all(engine)  # pylint: disable=no-member

    layer = SemanticLayer(
        uuid=uuid.uuid4(),
        name="test_layer",
        type="test",
        configuration="{}",
    )
    session.add(layer)
    session.flush()

    view = SemanticView(
        id=1,
        uuid=uuid.uuid4(),
        name="test_view",
        semantic_layer_uuid=layer.uuid,
        configuration="{}",
    )
    session.add(view)
    session.flush()

    return session


def test_find_by_id_uses_integer_id_column(
    session_with_semantic_view: Session,
) -> None:
    """
    SemanticViewDAO.find_by_id must look up by the integer ``id`` column, not
    by ``uuid``.

    Regression test: SemanticViewDAO previously set ``id_column_name = "uuid"``,
    which caused find_by_id(pk) to filter on the UUID column using an integer
    value, always returning None and making every PUT request return 404.
    """
    from zobi.daos.semantic_layer import SemanticViewDAO
    from zobi.semantic_layers.models import SemanticView

    view = session_with_semantic_view.query(SemanticView).one()

    # Sanity check: the view has an auto-assigned integer id
    assert isinstance(view.id, int)

    result = SemanticViewDAO.find_by_id(view.id)

    assert result is not None, (
        "find_by_id returned None for a valid integer id — "
        "id_column_name is likely set to 'uuid' instead of 'id'"
    )
    assert result.id == view.id
    assert result.name == "test_view"
