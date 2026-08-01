"""convert_metric_currencies_from_str_to_json

Revision ID: 363a9b1e8992
Revises: f1edd4a4d4f2
Create Date: 2025-06-06 00:39:00.107746

"""

import json  # noqa: TID251
import logging

from alembic import op
from sqlalchemy import Column, Integer, JSON, String
from sqlalchemy.ext.declarative import declarative_base

from zobi import db
from zobi.migrations.shared.utils import paginated_update

logger = logging.getLogger("alembic.env")

# revision identifiers, used by Alembic.
revision = "363a9b1e8992"
down_revision = "f1edd4a4d4f2"

Base = declarative_base()


class SqlMetric(Base):
    __tablename__ = "sql_metrics"

    id = Column(Integer, primary_key=True)
    metric_name = Column(String(512))
    currency = Column(JSON)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    currency_configs = session.query(SqlMetric).filter(SqlMetric.currency.isnot(None))
    for metric in paginated_update(
        currency_configs,
        lambda current, total: logger.info("Upgrading %s/%s metrics", current, total),
    ):
        while True:
            if isinstance(metric.currency, str):
                try:
                    metric.currency = json.loads(metric.currency)
                except Exception as e:
                    logger.error(
                        "Error loading metric %s as json: %s", metric.metric_name, e
                    )
                    metric.currency = {}
                    break
            else:
                break


def downgrade():
    """
    No op downgrade.

    The downgrade could just do `metric.currency = json.dumps(metric.currency)`. However
    this is happening after `f1edd4a4d4f2` which already converted the currency column
    to JSON at the DB level, so we shouldn't have currencies in str anymore. It was the
    case because the client was still stringifying it.
    """
    pass
