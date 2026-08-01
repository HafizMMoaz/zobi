"""add subject column to report schedule

Revision ID: 9621c6d56ffb
Revises: 87ffc36f9842
Create Date: 2024-05-10 11:09:12.046862

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "9621c6d56ffb"
down_revision = "87ffc36f9842"


def upgrade():
    op.add_column(
        "report_schedule",
        sa.Column("email_subject", sa.String(length=255), nullable=True),
    )


def downgrade():
    op.drop_column("report_schedule", "email_subject")
