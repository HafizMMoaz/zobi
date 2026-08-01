"""drop_url_table

Revision ID: e863403c0c50
Revises: 214f580d09c9
Create Date: 2023-12-28 16:03:31.691033

"""

# revision identifiers, used by Alembic.
revision = "e863403c0c50"
down_revision = "214f580d09c9"

from importlib import import_module  # noqa: E402

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402

module = import_module("zobi.migrations.versions.2016-01-13_20-24_8e80a26a31db_")


def upgrade():
    module.downgrade()


def downgrade():
    module.upgrade()
    op.alter_column("url", "changed_on", existing_type=sa.DATETIME(), nullable=True)
    op.alter_column("url", "created_on", existing_type=sa.DATETIME(), nullable=True)
