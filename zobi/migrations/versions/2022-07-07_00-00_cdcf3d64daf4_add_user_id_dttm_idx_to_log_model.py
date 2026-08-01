"""Add user_id and dttm composite index to Log model

Revision ID: cdcf3d64daf4
Revises: 7fb8bca906d2
Create Date: 2022-04-05 13:27:06.028908

"""

from alembic import op

from zobi.migrations.shared.utils import create_index, drop_index

# revision identifiers, used by Alembic.
revision = "cdcf3d64daf4"
down_revision = "7fb8bca906d2"


def upgrade():
    create_index(
        "logs", op.f("ix_logs_user_id_dttm"), ["user_id", "dttm"], unique=False
    )


def downgrade():
    drop_index(index_name=op.f("ix_logs_user_id_dttm"), table_name="logs")
