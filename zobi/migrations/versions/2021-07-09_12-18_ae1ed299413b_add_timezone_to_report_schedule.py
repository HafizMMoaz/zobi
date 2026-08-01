"""add_timezone_to_report_schedule

Revision ID: ae1ed299413b
Revises: 030c840e3a1c
Create Date: 2021-07-09 12:18:52.057815

"""

# revision identifiers, used by Alembic.
revision = "ae1ed299413b"
down_revision = "030c840e3a1c"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    with op.batch_alter_table("report_schedule") as batch_op:
        batch_op.add_column(
            sa.Column(
                "timezone", sa.String(length=100), nullable=False, server_default="UTC"
            )
        )


def downgrade():
    with op.batch_alter_table("report_schedule") as batch_op:
        batch_op.drop_column("timezone")
