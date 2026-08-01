"""add_extra_column_to_columns_model

Revision ID: 181091c0ef16
Revises: 07071313dd52
Create Date: 2021-08-24 23:27:30.403308

"""

# revision identifiers, used by Alembic.
revision = "181091c0ef16"
down_revision = "021b81fe4fbb"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    with op.batch_alter_table("table_columns") as batch_op:
        batch_op.add_column(sa.Column("extra", sa.Text(), nullable=True))


def downgrade():
    with op.batch_alter_table("table_columns") as batch_op:
        batch_op.drop_column("extra")
