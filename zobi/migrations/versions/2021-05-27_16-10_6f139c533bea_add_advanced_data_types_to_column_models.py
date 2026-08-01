"""adding advanced data type to column models

Revision ID: 6f139c533bea
Revises: cbe71abde154
Create Date: 2021-05-27 16:10:59.567684

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "6f139c533bea"
down_revision = "cbe71abde154"


def upgrade():
    with op.batch_alter_table("table_columns") as batch_op:
        batch_op.add_column(
            sa.Column(
                "advanced_data_type",
                sa.VARCHAR(255),
                nullable=True,
            )
        )
    with op.batch_alter_table("columns") as batch_op:
        batch_op.add_column(
            sa.Column(
                "advanced_data_type",
                sa.VARCHAR(255),
                nullable=True,
            )
        )
    with op.batch_alter_table("sl_columns") as batch_op:
        batch_op.add_column(
            sa.Column(
                "advanced_data_type",
                sa.Text,
                nullable=True,
            )
        )


def downgrade():
    with op.batch_alter_table("table_columns") as batch_op:
        batch_op.drop_column("advanced_data_type")
    with op.batch_alter_table("columns") as batch_op:
        batch_op.drop_column("advanced_data_type")
    with op.batch_alter_table("sl_columns") as batch_op:
        batch_op.drop_column("advanced_data_type")
