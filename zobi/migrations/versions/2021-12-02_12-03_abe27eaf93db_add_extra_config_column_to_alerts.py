"""add_extra_config_column_to_alerts

Revision ID: abe27eaf93db
Revises: 0ca9e5f1dacd
Create Date: 2021-12-02 12:03:20.691171

"""

# revision identifiers, used by Alembic.
revision = "abe27eaf93db"
down_revision = "0ca9e5f1dacd"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402
from sqlalchemy import String  # noqa: E402
from sqlalchemy.sql import column, table  # noqa: E402

report_schedule = table("report_schedule", column("extra", String))


def upgrade():
    bind = op.get_bind()

    with op.batch_alter_table("report_schedule") as batch_op:
        batch_op.add_column(
            sa.Column(
                "extra",
                sa.Text(),
                nullable=True,
                default="{}",
            ),
        )
    bind.execute(report_schedule.update().values({"extra": "{}"}))
    with op.batch_alter_table("report_schedule") as batch_op:
        batch_op.alter_column("extra", existing_type=sa.Text(), nullable=False)


def downgrade():
    op.drop_column("report_schedule", "extra")
