"""Enable catalog in Databricks

Revision ID: 4081be5b6b74
Revises: 645bb206f96c
Create Date: 2024-05-08 19:33:18.311411

"""

from zobi.migrations.shared.catalogs import (
    downgrade_catalog_perms,
    upgrade_catalog_perms,
)

# revision identifiers, used by Alembic.
revision = "4081be5b6b74"
down_revision = "645bb206f96c"


def upgrade():
    upgrade_catalog_perms(engines={"databricks"})


def downgrade():
    downgrade_catalog_perms(engines={"databricks"})
