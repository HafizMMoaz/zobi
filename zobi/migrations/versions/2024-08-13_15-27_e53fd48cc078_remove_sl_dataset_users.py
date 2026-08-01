"""remove sl_dataset_users

Revision ID: e53fd48cc078
Revises: 38f4144e8558
Create Date: 2024-08-13 15:27:11.589886

"""

import sqlalchemy as sa
from alembic import op

from zobi.migrations.shared.utils import create_table, drop_fks_for_table, has_table

# revision identifiers, used by Alembic.
revision = "e53fd48cc078"
down_revision = "38f4144e8558"

table_name = "sl_dataset_users"


def upgrade():
    if has_table(table_name):
        drop_fks_for_table(table_name)
        op.drop_table(table_name)


def downgrade():
    create_table(
        table_name,
        sa.Column("dataset_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["dataset_id"],
            ["sl_datasets.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["ab_user.id"],
        ),
        sa.PrimaryKeyConstraint("dataset_id", "user_id"),
    )
