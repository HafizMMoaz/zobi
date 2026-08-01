"""add hide_left_bar to tabstate

Revision ID: 67da9ef1ef9c
Revises: 1412ec1e5a7b
Create Date: 2021-02-22 11:22:10.156942

"""

# revision identifiers, used by Alembic.
revision = "67da9ef1ef9c"
down_revision = "1412ec1e5a7b"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402
from sqlalchemy.sql import expression  # noqa: E402


def upgrade():
    with op.batch_alter_table("tab_state") as batch_op:
        batch_op.add_column(
            sa.Column(
                "hide_left_bar",
                sa.Boolean(),
                nullable=False,
                server_default=expression.false(),
            )
        )


def downgrade():
    with op.batch_alter_table("tab_state") as batch_op:
        batch_op.drop_column("hide_left_bar")
