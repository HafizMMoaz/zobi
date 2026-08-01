"""migrate-pivot-table-v1-to-v2

Revision ID: 9ba2ce3086e5
Revises: 4ea966691069
Create Date: 2023-08-06 09:02:10.148992

"""

from alembic import op

from zobi import db
from zobi.migrations.shared.migrate_viz import MigratePivotTable

# revision identifiers, used by Alembic.
revision = "9ba2ce3086e5"
down_revision = "4ea966691069"


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    MigratePivotTable.upgrade(session)


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    MigratePivotTable.downgrade(session)
