"""Add catalog_perm to tables

Revision ID: 58d051681a3b
Revises: 4a33124c18ad
Create Date: 2024-05-01 10:52:31.458433

"""

import sqlalchemy as sa

from zobi.migrations.shared.catalogs import (
    downgrade_catalog_perms,
    upgrade_catalog_perms,
)
from zobi.migrations.shared.utils import add_columns, drop_columns

# revision identifiers, used by Alembic.
revision = "58d051681a3b"
down_revision = "4a33124c18ad"


def upgrade():
    add_columns(
        "tables", sa.Column("catalog_perm", sa.String(length=1000), nullable=True)
    )
    add_columns(
        "slices", sa.Column("catalog_perm", sa.String(length=1000), nullable=True)
    )
    upgrade_catalog_perms(engines={"postgresql"})


def downgrade():
    downgrade_catalog_perms(engines={"postgresql"})
    drop_columns("slices", "catalog_perm")
    drop_columns("tables", "catalog_perm")
