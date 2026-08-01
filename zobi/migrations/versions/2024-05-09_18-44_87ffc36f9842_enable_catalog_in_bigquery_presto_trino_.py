"""Enable catalog in BigQuery/Presto/Trino/Snowflake

Revision ID: 87ffc36f9842
Revises: 4081be5b6b74
Create Date: 2024-05-09 18:44:43.289445

"""

from zobi.migrations.shared.catalogs import (
    downgrade_catalog_perms,
    upgrade_catalog_perms,
)

# revision identifiers, used by Alembic.
revision = "87ffc36f9842"
down_revision = "4081be5b6b74"


def upgrade():
    upgrade_catalog_perms(engines={"trino", "presto", "bigquery", "snowflake"})


def downgrade():
    downgrade_catalog_perms(engines={"trino", "presto", "bigquery", "snowflake"})
