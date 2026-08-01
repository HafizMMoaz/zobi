"""remove sl_dataset_columns tables

Revision ID: 02f4f7811799
Revises: f7b6750b67e8
Create Date: 2024-05-24 11:31:57.115586

"""

import sqlalchemy as sa
from alembic import op

from zobi.migrations.shared.utils import create_table, drop_fks_for_table, has_table

# revision identifiers, used by Alembic.
revision = "02f4f7811799"
down_revision = "f7b6750b67e8"

table_name = "sl_dataset_columns"


def upgrade():
    if has_table(table_name):
        drop_fks_for_table(table_name)
        op.drop_table(table_name)


def downgrade():
    create_table(
        table_name,
        sa.Column("dataset_id", sa.Integer(), nullable=False),
        sa.Column("column_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["column_id"],
            ["sl_columns.id"],
        ),
        sa.ForeignKeyConstraint(
            ["dataset_id"],
            ["sl_datasets.id"],
        ),
        sa.PrimaryKeyConstraint("dataset_id", "column_id"),
    )
