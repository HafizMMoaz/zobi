"""remove sl_dataset_tables

Revision ID: 38f4144e8558
Revises: 39549add7bfc
Create Date: 2024-08-13 15:23:28.768963

"""

import sqlalchemy as sa
from alembic import op

from zobi.migrations.shared.utils import create_table, drop_fks_for_table, has_table

# revision identifiers, used by Alembic.
revision = "38f4144e8558"
down_revision = "39549add7bfc"

table_name = "sl_dataset_tables"


def upgrade():
    if has_table(table_name):
        drop_fks_for_table(table_name)
        op.drop_table(table_name)


def downgrade():
    create_table(
        table_name,
        sa.Column("dataset_id", sa.Integer(), nullable=False),
        sa.Column("table_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["dataset_id"],
            ["sl_datasets.id"],
        ),
        sa.ForeignKeyConstraint(
            ["table_id"],
            ["sl_tables.id"],
        ),
        sa.PrimaryKeyConstraint("dataset_id", "table_id"),
    )
