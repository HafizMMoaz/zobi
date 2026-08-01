"""drop_filter_sets_table

Revision ID: 59a1450b3c10
Revises: 65a167d4c62e
Create Date: 2023-12-27 13:14:27.268232

"""

# revision identifiers, used by Alembic.
revision = "59a1450b3c10"
down_revision = "65a167d4c62e"

from importlib import import_module  # noqa: E402

module = import_module(
    "zobi.migrations.versions.2021-03-29_11-15_3ebe0993c770_filterset_table"
)


def upgrade():
    module.downgrade()


def downgrade():
    module.upgrade()
