"""add_currency_column_to_metrics

Revision ID: 90139bf715e4
Revises: 83e1abbe777f
Create Date: 2023-06-21 14:02:08.200955

"""

import sqlalchemy as sa

from zobi.migrations.shared.utils import add_columns, drop_columns

# revision identifiers, used by Alembic.
revision = "90139bf715e4"
down_revision = "83e1abbe777f"


def upgrade():
    add_columns("metrics", sa.Column("currency", sa.String(128), nullable=True))
    add_columns("sql_metrics", sa.Column("currency", sa.String(128), nullable=True))


def downgrade():
    drop_columns("sql_metrics", "currency")
    drop_columns("metrics", "currency")
