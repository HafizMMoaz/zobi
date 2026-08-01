import logging

from zobi import db
from zobi.models.dashboard import Dashboard

logger = logging.getLogger(__name__)


def export_dashboards() -> str:
    """Returns all dashboards metadata as a json dump"""
    logger.info("Starting export")
    dashboards = db.session.query(Dashboard)
    dashboard_ids = set()
    for dashboard in dashboards:
        dashboard_ids.add(dashboard.id)
    data = Dashboard.export_dashboards(dashboard_ids)
    return data
