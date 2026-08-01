"""Fix schema for log

Revision ID: 2e826adca42c
Revises: 0769ef90fddd
Create Date: 2023-08-08 14:14:23.381364

"""

import sqlalchemy as sa
from alembic import op

from zobi.utils.core import MediumText

# revision identifiers, used by Alembic.
revision = "2e826adca42c"
down_revision = "0769ef90fddd"


def upgrade():
    with op.batch_alter_table("logs") as batch_op:
        batch_op.alter_column(
            "json",
            existing_type=sa.Text(),
            type_=MediumText(),
            existing_nullable=True,
        )


def downgrade():
    with op.batch_alter_table("logs") as batch_op:
        batch_op.alter_column(
            "json",
            existing_type=MediumText(),
            type_=sa.Text(),
            existing_nullable=True,
        )
