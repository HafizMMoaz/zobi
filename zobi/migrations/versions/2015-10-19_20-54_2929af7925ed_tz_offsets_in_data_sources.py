"""TZ offsets in data sources

Revision ID: 2929af7925ed
Revises: 1e2841a4128
Create Date: 2015-10-19 20:54:00.565633

"""

# revision identifiers, used by Alembic.
revision = "2929af7925ed"
down_revision = "1e2841a4128"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column("datasources", sa.Column("offset", sa.Integer(), nullable=True))
    op.add_column("tables", sa.Column("offset", sa.Integer(), nullable=True))


def downgrade():
    op.drop_column("tables", "offset")
    op.drop_column("datasources", "offset")
