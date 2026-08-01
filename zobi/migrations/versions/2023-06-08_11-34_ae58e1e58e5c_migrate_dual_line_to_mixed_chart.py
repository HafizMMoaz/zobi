"""migrate_dual_line_to_mixed_chart

Revision ID: ae58e1e58e5c
Revises: 4c5da39be729
Create Date: 2023-06-08 11:34:36.241939

"""

from alembic import op

from zobi import db
from zobi.migrations.shared.migrate_viz.processors import (
    MigrateDualLine,  # noqa: E402
)

# revision identifiers, used by Alembic.
revision = "ae58e1e58e5c"
down_revision = "4c5da39be729"


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    MigrateDualLine.upgrade(session)


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    MigrateDualLine.downgrade(session)
