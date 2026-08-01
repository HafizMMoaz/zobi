"""add impersonate_user to dbs

Revision ID: a9c47e2c1547
Revises: ca69c70ec99b
Create Date: 2017-08-31 17:35:58.230723

"""

# revision identifiers, used by Alembic.
revision = "a9c47e2c1547"
down_revision = "ca69c70ec99b"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column("dbs", sa.Column("impersonate_user", sa.Boolean(), nullable=True))


def downgrade():
    op.drop_column("dbs", "impersonate_user")
