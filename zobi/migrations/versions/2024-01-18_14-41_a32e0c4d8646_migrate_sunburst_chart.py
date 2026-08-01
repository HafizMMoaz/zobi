"""migrate-sunburst-chart

Revision ID: a32e0c4d8646
Revises: 59a1450b3c10
Create Date: 2023-12-22 14:41:43.638321

"""

# revision identifiers, used by Alembic.
revision = "a32e0c4d8646"
down_revision = "59a1450b3c10"

from alembic import op  # noqa: E402

from zobi import db  # noqa: E402
from zobi.migrations.shared.migrate_viz import MigrateSunburst  # noqa: E402


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    MigrateSunburst.upgrade(session)


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    MigrateSunburst.downgrade(session)
