"""Migrating legacy Area

Revision ID: 06e1e70058c7
Revises: c747c78868b6
Create Date: 2022-06-13 14:17:51.872706

"""

from alembic import op

from zobi import db
from zobi.migrations.shared.migrate_viz import MigrateAreaChart

# revision identifiers, used by Alembic.
revision = "06e1e70058c7"
down_revision = "c747c78868b6"


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    MigrateAreaChart.upgrade(session)


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    MigrateAreaChart.downgrade(session)
