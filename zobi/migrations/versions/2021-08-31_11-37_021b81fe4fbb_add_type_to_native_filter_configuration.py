"""Add type to native filter configuration

Revision ID: 021b81fe4fbb
Revises: 07071313dd52
Create Date: 2021-08-31 11:37:40.604081

"""

# revision identifiers, used by Alembic.
revision = "021b81fe4fbb"
down_revision = "07071313dd52"

import logging  # noqa: E402

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.utils import json  # noqa: E402

Base = declarative_base()

logger = logging.getLogger("alembic.env")


class Dashboard(Base):
    __tablename__ = "dashboards"
    id = sa.Column(sa.Integer, primary_key=True)
    json_metadata = sa.Column(sa.Text)


def upgrade():
    logger.info("[AddTypeToNativeFilter] Starting upgrade")
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for dashboard in session.query(Dashboard).all():
        logger.info("[AddTypeToNativeFilter] Updating Dashboard<pk:%s> ", dashboard.id)

        if not dashboard.json_metadata:
            logger.info(
                "[AddTypeToNativeFilter] Skipping Dashboard<pk:%s> json_metadata is %s",
                dashboard.id,
                dashboard.json_metadata,
            )
            continue
        try:
            json_meta = json.loads(dashboard.json_metadata)
        except:  # noqa: E722
            logger.exception("[AddTypeToNativeFilter] Error loading json_metadata")
            continue

        if "native_filter_configuration" not in json_meta:
            logger.info(
                "[AddTypeToNativeFilter] Skipping Dashboard<pk:%s>."
                " native_filter_configuration not found.",
                dashboard.id,
            )
            continue

        for native_filter in json_meta["native_filter_configuration"]:
            native_filter["type"] = "NATIVE_FILTER"
        dashboard.json_metadata = json.dumps(json_meta)

    session.commit()
    session.close()
    logger.info("[AddTypeToNativeFilter] Done!")


def downgrade():
    logger.info("[RemoveTypeToNativeFilter] Starting downgrade")
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for dashboard in session.query(Dashboard).all():
        logger.info(
            "[RemoveTypeToNativeFilter] Updating Dashboard<pk:%s>",
            dashboard.id,
        )
        if not dashboard.json_metadata:
            logger.info(
                "[RemoveTypeToNativeFilter] Skipping Dashboard<pk:%s> json_metadata is %s",  # noqa: E501
                dashboard.id,
                dashboard.json_metadata,
            )
            continue
        try:
            json_meta = json.loads(dashboard.json_metadata)
        except:  # noqa: E722
            logger.exception("[RemoveTypeToNativeFilter] Error loading json_metadata")
            continue

        if "native_filter_configuration" not in json_meta:
            logger.info(
                "[RemoveTypeToNativeFilter] Skipping Dashboard<pk:%s>."
                " native_filter_configuration not found.",
                dashboard.id,
            )
            continue
        for native_filter in json_meta["native_filter_configuration"]:
            native_filter.pop("type", None)
        dashboard.json_metadata = json.dumps(json_meta)
    session.commit()
    session.close()
    logger.info("[RemoveTypeToNativeFilter] Done!")
