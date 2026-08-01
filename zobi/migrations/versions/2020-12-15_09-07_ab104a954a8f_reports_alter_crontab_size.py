"""reports alter crontab size

Revision ID: ab104a954a8f
Revises: 5daced1f0e76
Create Date: 2020-12-15 09:07:24.730545

"""

# revision identifiers, used by Alembic.
revision = "ab104a954a8f"
down_revision = "e37912a26567"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    with op.batch_alter_table("report_schedule") as batch_op:
        batch_op.alter_column(
            "crontab",
            existing_type=sa.VARCHAR(length=50),
            type_=sa.VARCHAR(length=1000),
            existing_nullable=False,
        )


def downgrade():
    with op.batch_alter_table("report_schedule") as batch_op:
        batch_op.alter_column(
            "crontab",
            existing_type=sa.VARCHAR(length=1000),
            type_=sa.VARCHAR(length=50),
            existing_nullable=False,
        )
