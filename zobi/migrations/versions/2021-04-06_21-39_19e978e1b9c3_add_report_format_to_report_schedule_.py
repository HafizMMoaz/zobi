"""add_report_format_to_report_schedule_model.py

Revision ID: 19e978e1b9c3
Revises: fc3a3a8ff221
Create Date: 2021-04-06 21:39:52.259223

"""

# revision identifiers, used by Alembic.
revision = "19e978e1b9c3"
down_revision = "fc3a3a8ff221"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column(
        "report_schedule",
        sa.Column(
            "report_format", sa.String(length=50), server_default="PNG", nullable=True
        ),
    )


def downgrade():
    op.drop_column("report_schedule", "report_format")
