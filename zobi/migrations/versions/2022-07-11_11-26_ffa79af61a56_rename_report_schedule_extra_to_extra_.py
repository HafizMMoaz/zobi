"""rename report_schedule.extra to extra_json

So we can reuse the ExtraJSONMixin

Revision ID: ffa79af61a56
Revises: 409c7b420ab0
Create Date: 2022-07-11 11:26:00.010714

"""

# revision identifiers, used by Alembic.
revision = "ffa79af61a56"
down_revision = "409c7b420ab0"

from alembic import op  # noqa: E402
from sqlalchemy.types import Text  # noqa: E402


def upgrade():
    op.alter_column(
        "report_schedule",
        "extra",
        new_column_name="extra_json",
        # existing info is required for MySQL
        existing_type=Text,
        existing_nullable=True,
    )


def downgrade():
    op.alter_column(
        "report_schedule",
        "extra_json",
        new_column_name="extra",
        existing_type=Text,
        existing_nullable=True,
    )
