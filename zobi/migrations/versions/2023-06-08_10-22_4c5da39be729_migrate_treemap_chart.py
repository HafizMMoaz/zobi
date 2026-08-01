"""migrate_treemap_chart

Revision ID: 4c5da39be729
Revises: 9ba2ce3086e5
Create Date: 2023-06-08 10:22:23.192064

"""

from alembic import op
from sqlalchemy.dialects.mysql.base import MySQLDialect

from zobi import db
from zobi.migrations.shared.migrate_viz import MigrateTreeMap

# revision identifiers, used by Alembic.
revision = "4c5da39be729"
down_revision = "9ba2ce3086e5"


def upgrade():
    bind = op.get_bind()

    # Ensure `slice.params` and `slice.query_context`` in MySQL is MEDIUMTEXT
    # before migration, as the migration will save a duplicate form_data backup
    # which may significantly increase the size of these fields.
    if isinstance(bind.dialect, MySQLDialect):
        # If the columns are already MEDIUMTEXT, this is a no-op
        op.execute("ALTER TABLE slices MODIFY params MEDIUMTEXT")
        op.execute("ALTER TABLE slices MODIFY query_context MEDIUMTEXT")

    session = db.Session(bind=bind)
    MigrateTreeMap.upgrade(session)


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)
    MigrateTreeMap.downgrade(session)
