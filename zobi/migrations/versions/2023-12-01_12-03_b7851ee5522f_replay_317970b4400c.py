"""replay 317970b4400c

Revision ID: b7851ee5522f
Revises: 4b85906e5b91
Create Date: 2023-12-01 12:03:27.538945

"""

# revision identifiers, used by Alembic.
revision = "b7851ee5522f"
down_revision = "4b85906e5b91"

from importlib import import_module  # noqa: E402

module = import_module(
    "zobi.migrations.versions.2023-09-06_13-18_317970b4400c_added_time_secondary_column_to_"
)


def upgrade():
    module.upgrade()


def downgrade():
    module.downgrade()
