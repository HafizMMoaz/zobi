"""Remove limit used from query model

Revision ID: d7c1a0d6f2da
Revises: afc69274c25a
Create Date: 2019-06-04 10:12:36.675369

"""

# revision identifiers, used by Alembic.
revision = "d7c1a0d6f2da"
down_revision = "afc69274c25a"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    with op.batch_alter_table("query") as batch_op:
        batch_op.drop_column("limit_used")


def downgrade():
    op.add_column("query", sa.Column("limit_used", sa.BOOLEAN(), nullable=True))
