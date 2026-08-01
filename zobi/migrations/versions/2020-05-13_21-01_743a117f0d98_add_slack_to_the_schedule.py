"""Add slack to the schedule

Revision ID: 743a117f0d98
Revises: 620241d1153f
Create Date: 2020-05-13 21:01:26.163478

"""

# revision identifiers, used by Alembic.
revision = "743a117f0d98"
down_revision = "620241d1153f"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column(
        "dashboard_email_schedules",
        sa.Column("slack_channel", sa.Text(), nullable=True),
    )
    op.add_column(
        "slice_email_schedules", sa.Column("slack_channel", sa.Text(), nullable=True)
    )


def downgrade():
    op.drop_column("dashboard_email_schedules", "slack_channel")
    op.drop_column("slice_email_schedules", "slack_channel")
