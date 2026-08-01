"""remove sl_table_columns_table

Revision ID: 39549add7bfc
Revises: 02f4f7811799
Create Date: 2024-08-13 15:17:23.273168

"""

import sqlalchemy as sa
from alembic import op

from zobi.migrations.shared.utils import create_table, drop_fks_for_table, has_table

# revision identifiers, used by Alembic.
revision = "39549add7bfc"
down_revision = "02f4f7811799"

table_name = "sl_table_columns"


def upgrade():
    if has_table(table_name):
        drop_fks_for_table(table_name)
        op.drop_table(table_name)


def downgrade():
    create_table(
        table_name,
        sa.Column("table_id", sa.Integer(), nullable=False),
        sa.Column("column_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["column_id"],
            ["sl_columns.id"],
        ),
        sa.ForeignKeyConstraint(
            ["table_id"],
            ["sl_tables.id"],
        ),
        sa.PrimaryKeyConstraint("table_id", "column_id"),
    )
