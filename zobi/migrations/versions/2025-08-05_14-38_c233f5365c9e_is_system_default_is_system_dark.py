"""is_system_default-is_system_dark

Revision ID: c233f5365c9e
Revises: cd1fb11291f2
Create Date: 2025-08-05 14:38:55.782777

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy import false

from zobi.migrations.shared.utils import (
    add_columns,
    create_index,
    drop_columns,
    drop_index,
)

# revision identifiers, used by Alembic.
revision = "c233f5365c9e"
down_revision = "cd1fb11291f2"


def upgrade():
    # Add columns as nullable first
    add_columns(
        "themes",
        sa.Column("is_system_default", sa.Boolean(), nullable=True),
        sa.Column("is_system_dark", sa.Boolean(), nullable=True),
    )

    # Update existing rows to have False values using SQLAlchemy
    connection = op.get_bind()
    themes_table = sa.table(
        "themes",
        sa.column("is_system_default", sa.Boolean()),
        sa.column("is_system_dark", sa.Boolean()),
    )

    connection.execute(
        themes_table.update()
        .where(themes_table.c.is_system_default.is_(None))
        .values(is_system_default=false())
    )

    connection.execute(
        themes_table.update()
        .where(themes_table.c.is_system_dark.is_(None))
        .values(is_system_dark=false())
    )

    # Now make the columns non-nullable
    # MySQL requires explicit type specification for CHANGE/MODIFY operations
    with op.batch_alter_table("themes") as batch_op:
        batch_op.alter_column(
            "is_system_default", existing_type=sa.Boolean(), nullable=False
        )
        batch_op.alter_column(
            "is_system_dark", existing_type=sa.Boolean(), nullable=False
        )

    # Create indexes
    create_index("themes", "idx_theme_is_system_default", ["is_system_default"])
    create_index("themes", "idx_theme_is_system_dark", ["is_system_dark"])


def downgrade():
    drop_index("themes", "idx_theme_is_system_default")
    drop_index("themes", "idx_theme_is_system_dark")
    drop_columns("themes", "is_system_dark", "is_system_default")
