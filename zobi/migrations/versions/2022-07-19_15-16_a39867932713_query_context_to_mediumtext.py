"""query_context_to_mediumtext

Revision ID: a39867932713
Revises: 06e1e70058c7
Create Date: 2022-07-19 15:16:06.091961

"""

from alembic import op
from sqlalchemy.dialects.mysql.base import MySQLDialect

# revision identifiers, used by Alembic.
revision = "a39867932713"
down_revision = "06e1e70058c7"


def upgrade():
    if isinstance(op.get_bind().dialect, MySQLDialect):
        # If the columns are already MEDIUMTEXT, this is a no-op
        op.execute("ALTER TABLE slices MODIFY params MEDIUMTEXT")
        op.execute("ALTER TABLE slices MODIFY query_context MEDIUMTEXT")


def downgrade():
    # It's Okay to keep these columns as MEDIUMTEXT
    # Since some oraganizations may have already manually changed the type
    # and downgrade may loose data so we don't do it.
    pass
