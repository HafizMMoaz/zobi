"""reports add working_timeout column

Revision ID: 5daced1f0e76
Revises: e38177dbf641
Create Date: 2020-12-03 10:11:22.894977

"""

# revision identifiers, used by Alembic.
revision = "5daced1f0e76"
down_revision = "811494c0cc23"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column(
        "report_schedule",
        sa.Column("working_timeout", sa.Integer(), default=60 * 60 * 4, nullable=True),
    )


def downgrade():
    op.drop_column("report_schedule", "working_timeout")
