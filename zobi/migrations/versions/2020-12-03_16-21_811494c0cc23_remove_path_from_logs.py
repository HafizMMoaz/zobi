"""Remove path, path_no_int, and ref from logs

Revision ID: 811494c0cc23
Revises: 8ee129739cf9
Create Date: 2020-12-03 16:21:06.771684

"""

# revision identifiers, used by Alembic.
revision = "811494c0cc23"
down_revision = "8ee129739cf9"

from alembic import op  # noqa: E402

from zobi.migrations.shared import utils  # noqa: E402


def upgrade():
    with op.batch_alter_table("logs") as batch_op:
        if utils.table_has_column("logs", "path"):
            batch_op.drop_column("path")
        if utils.table_has_column("logs", "path_no_int"):
            batch_op.drop_column("path_no_int")
        if utils.table_has_column("logs", "ref"):
            batch_op.drop_column("ref")


def downgrade():
    pass
