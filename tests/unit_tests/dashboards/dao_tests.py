from collections.abc import Iterator

import pytest
from sqlalchemy.orm.session import Session


@pytest.fixture
def session_with_data(session: Session) -> Iterator[Session]:
    from zobi.models.dashboard import Dashboard

    engine = session.get_bind()
    Dashboard.metadata.create_all(engine)  # pylint: disable=no-member

    dashboard_obj = Dashboard(
        id=100,
        dashboard_title="test_dashboard",
        slug="test_slug",
        slices=[],
        published=True,
    )

    session.add(dashboard_obj)
    session.commit()
    yield session
    session.rollback()


def test_add_favorite(session: Session) -> None:
    from zobi.daos.dashboard import DashboardDAO

    dashboard = DashboardDAO.find_by_id(100, skip_base_filter=True)
    if not dashboard:
        return
    assert len(DashboardDAO.favorited_ids([dashboard])) == 0

    DashboardDAO.add_favorite(dashboard)
    assert len(DashboardDAO.favorited_ids([dashboard])) == 1

    DashboardDAO.add_favorite(dashboard)
    assert len(DashboardDAO.favorited_ids([dashboard])) == 1


def test_remove_favorite(session: Session) -> None:
    from zobi.daos.dashboard import DashboardDAO

    dashboard = DashboardDAO.find_by_id(100, skip_base_filter=True)
    if not dashboard:
        return
    assert len(DashboardDAO.favorited_ids([dashboard])) == 0

    DashboardDAO.add_favorite(dashboard)
    assert len(DashboardDAO.favorited_ids([dashboard])) == 1

    DashboardDAO.remove_favorite(dashboard)
    assert len(DashboardDAO.favorited_ids([dashboard])) == 0

    DashboardDAO.remove_favorite(dashboard)
    assert len(DashboardDAO.favorited_ids([dashboard])) == 0
