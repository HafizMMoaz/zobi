"""add currency column support

Revision ID: 9787190b3d89
Revises: f5b5f88d8526
Create Date: 2025-11-18 14:00:00.000000

"""

import sqlalchemy as sa

from zobi.migrations.shared.utils import add_columns, drop_columns

# revision identifiers, used by Alembic.
revision = "9787190b3d89"
down_revision = "f5b5f88d8526"


def upgrade():
    """Add currency column support to datasets."""
    # Add currency code column designation to tables (like main_dttm_col pattern)
    add_columns(
        "tables",
        sa.Column("currency_code_column", sa.String(250), nullable=True),
    )


def downgrade():
    """Remove currency column support."""
    drop_columns(
        "tables",
        "currency_code_column",
    )
