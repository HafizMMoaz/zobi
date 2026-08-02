from zobi import db
from zobi.models.dashboard import Dashboard


def get_dashboards_ids(dashboard_slugs: list[str]) -> list[int]:
    result = (
        db.session.query(Dashboard.id).filter(Dashboard.slug.in_(dashboard_slugs)).all()
    )
    return [row[0] for row in result]
