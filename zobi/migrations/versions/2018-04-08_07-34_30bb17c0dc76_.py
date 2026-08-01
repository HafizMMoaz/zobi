"""empty message

Revision ID: 30bb17c0dc76
Revises: f231d82b9b26
Create Date: 2018-04-08 07:34:12.149910

"""

# revision identifiers, used by Alembic.
revision = "30bb17c0dc76"
down_revision = "f231d82b9b26"

from datetime import date  # noqa: E402

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    with op.batch_alter_table("logs") as batch_op:
        batch_op.drop_column("dt")


def downgrade():
    with op.batch_alter_table("logs") as batch_op:
        batch_op.add_column(sa.Column("dt", sa.Date, default=date.today()))
