"""add encrypted_extra to dbs

Revision ID: cca2f5d568c8
Revises: b6fa807eac07
Create Date: 2019-10-09 15:05:06.965042

"""

# revision identifiers, used by Alembic.
revision = "cca2f5d568c8"
down_revision = "b6fa807eac07"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column("dbs", sa.Column("encrypted_extra", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("dbs", "encrypted_extra")
