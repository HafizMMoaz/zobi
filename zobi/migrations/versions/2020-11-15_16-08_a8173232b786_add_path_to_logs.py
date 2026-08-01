"""Add path to logs

Revision ID: a8173232b786
Revises: 49b5a32daba5
Create Date: 2020-11-15 16:08:24.580764

"""

# revision identifiers, used by Alembic.
revision = "a8173232b786"
down_revision = "49b5a32daba5"

from alembic import op  # noqa: E402

from zobi.migrations.shared import utils  # noqa: E402


def upgrade():
    # This migration was modified post hoc to avoid locking the large logs table
    # during migrations.
    pass


def downgrade():
    with op.batch_alter_table("logs") as batch_op:
        if utils.table_has_column("logs", "path"):
            batch_op.drop_column("path")
        if utils.table_has_column("logs", "path_no_int"):
            batch_op.drop_column("path_no_int")
        if utils.table_has_column("logs", "ref"):
            batch_op.drop_column("ref")
