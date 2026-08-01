"""add theme_id to dashboard model

Revision ID: cd1fb11291f2
Revises: 3fd555e76e3d
Create Date: 2025-07-15 18:41:43.496256

"""

import sqlalchemy as sa

from zobi.migrations.shared.utils import (
    add_columns,
    create_fks_for_table,
    drop_columns,
)

# revision identifiers, used by Alembic.
revision = "cd1fb11291f2"
down_revision = "3fd555e76e3d"


def upgrade():
    add_columns(
        "dashboards",
        sa.Column("theme_id", sa.Integer(), nullable=True),
    )

    create_fks_for_table(
        "fk_dashboards_theme_id_themes",
        "dashboards",
        "themes",
        ["theme_id"],
        ["id"],
    )


def downgrade():
    # Drop foreign key constraint first
    from zobi.migrations.shared.utils import drop_fks_for_table

    drop_fks_for_table("dashboards", ["fk_dashboards_theme_id_themes"])

    drop_columns("dashboards", "theme_id")
