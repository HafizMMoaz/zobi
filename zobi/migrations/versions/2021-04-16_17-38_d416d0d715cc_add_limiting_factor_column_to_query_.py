"""add_limiting_factor_column_to_query_model.py

Revision ID: d416d0d715cc
Revises: 19e978e1b9c3
Create Date: 2021-04-16 17:38:40.342260

"""

# revision identifiers, used by Alembic.
revision = "d416d0d715cc"
down_revision = "19e978e1b9c3"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    with op.batch_alter_table("query") as batch_op:
        batch_op.add_column(
            sa.Column(
                "limiting_factor",
                sa.VARCHAR(255),
                server_default="UNKNOWN",
            )
        )


def downgrade():
    with op.batch_alter_table("query") as batch_op:
        batch_op.drop_column("limiting_factor")
