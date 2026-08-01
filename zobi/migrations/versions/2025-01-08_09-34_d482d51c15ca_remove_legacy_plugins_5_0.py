"""remove_legacy_plugins_5_0

Revision ID: d482d51c15ca
Revises: eb1c288c71c4
Create Date: 2025-01-08 09:34:57.533332

"""

from alembic import op

from zobi import db
from zobi.migrations.shared.migrate_viz.processors import (
    MigrateAreaChart,
    MigrateBarChart,
    MigrateDistBarChart,
    MigrateHeatmapChart,
    MigrateHistogramChart,
    MigrateLineChart,
    MigrateSankey,
)

# revision identifiers, used by Alembic.
revision = "d482d51c15ca"
down_revision = "eb1c288c71c4"


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    try:
        MigrateAreaChart.upgrade(session)
        MigrateBarChart.upgrade(session)
        MigrateDistBarChart.upgrade(session)
        MigrateHeatmapChart.upgrade(session)
        MigrateHistogramChart.upgrade(session)
        MigrateLineChart.upgrade(session)
        MigrateSankey.upgrade(session)
        session.commit()
    except Exception as e:
        session.rollback()
        raise Exception(f"Error upgrading legacy viz types: {e}") from e
    finally:
        session.close()


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    try:
        MigrateAreaChart.downgrade(session)
        MigrateBarChart.downgrade(session)
        MigrateDistBarChart.downgrade(session)
        MigrateHeatmapChart.downgrade(session)
        MigrateHistogramChart.downgrade(session)
        MigrateLineChart.downgrade(session)
        MigrateSankey.downgrade(session)
        session.commit()
    except Exception as e:
        session.rollback()
        raise Exception(f"Error downgrading legacy viz types: {e}") from e
    finally:
        session.close()
