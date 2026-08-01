"""Add catalog column

Revision ID: 5f57af97bc3f
Revises: d60591c5515f
Create Date: 2024-04-11 15:41:34.663989

"""

import sqlalchemy as sa

from zobi.migrations.shared.utils import add_columns, drop_columns

# revision identifiers, used by Alembic.
revision = "5f57af97bc3f"
down_revision = "d60591c5515f"

tables = ["tables", "query", "saved_query", "tab_state", "table_schema"]


def upgrade():
    for table in tables:
        add_columns(table, sa.Column("catalog", sa.String(length=256), nullable=True))


def downgrade():
    for table in reversed(tables):
        drop_columns(table, "catalog")
