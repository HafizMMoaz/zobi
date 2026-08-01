"""remove sl_datasets

Revision ID: 48cbb571fa3a
Revises: 007a1abffe7e
Create Date: 2024-08-13 15:33:14.551012

"""

import sqlalchemy as sa
from alembic import op

from zobi.migrations.shared.utils import create_table, drop_fks_for_table, has_table

# revision identifiers, used by Alembic.
revision = "48cbb571fa3a"
down_revision = "007a1abffe7e"

table_name = "sl_datasets"


def upgrade():
    if has_table(table_name):
        drop_fks_for_table(table_name)
        op.drop_table(table_name)


def downgrade():
    create_table(
        table_name,
        sa.Column("uuid", sa.Numeric(precision=16), nullable=True),
        sa.Column("created_on", sa.DateTime(), nullable=True),
        sa.Column("changed_on", sa.DateTime(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("database_id", sa.Integer(), nullable=False),
        sa.Column("is_physical", sa.Boolean(), nullable=True),
        sa.Column("is_managed_externally", sa.Boolean(), nullable=False),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("expression", sa.Text(), nullable=True),
        sa.Column("external_url", sa.Text(), nullable=True),
        sa.Column("extra_json", sa.Text(), nullable=True),
        sa.Column("created_by_fk", sa.Integer(), nullable=True),
        sa.Column("changed_by_fk", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["changed_by_fk"],
            ["ab_user.id"],
        ),
        sa.ForeignKeyConstraint(
            ["created_by_fk"],
            ["ab_user.id"],
        ),
        sa.ForeignKeyConstraint(
            ["database_id"],
            ["dbs.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid"),
    )
