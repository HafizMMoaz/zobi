"""Add folders column to datasets

Revision ID: 94e7a3499973
Revises: 74ad1125881c
Create Date: 2025-03-03 20:52:24.585143

"""

import sqlalchemy as sa
from sqlalchemy.types import JSON

from zobi.migrations.shared.utils import add_columns, drop_columns

# revision identifiers, used by Alembic.
revision = "94e7a3499973"
down_revision = "74ad1125881c"


def upgrade():
    add_columns(
        "tables",
        sa.Column("folders", JSON, nullable=True),
    )


def downgrade():
    drop_columns("tables", "folders")
