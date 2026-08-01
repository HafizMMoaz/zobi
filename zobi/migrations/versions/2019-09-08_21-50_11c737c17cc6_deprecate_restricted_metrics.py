"""deprecate_restricted_metrics

Revision ID: 11c737c17cc6
Revises: def97f26fdfb
Create Date: 2019-09-08 21:50:58.200229

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "11c737c17cc6"
down_revision = "def97f26fdfb"


def upgrade():
    with op.batch_alter_table("metrics") as batch_op:
        batch_op.drop_column("is_restricted")
    with op.batch_alter_table("sql_metrics") as batch_op:
        batch_op.drop_column("is_restricted")


def downgrade():
    op.add_column(
        "sql_metrics", sa.Column("is_restricted", sa.BOOLEAN(), nullable=True)
    )
    op.add_column("metrics", sa.Column("is_restricted", sa.BOOLEAN(), nullable=True))
