"""json_metadata

Revision ID: bf646a0c1501
Revises: a23c6f8b1280
Create Date: 2023-06-28 19:49:59.217255

"""

import sqlalchemy as sa
from alembic import op

from zobi.utils.core import MediumText

# revision identifiers, used by Alembic.
revision = "bf646a0c1501"
down_revision = "a23c6f8b1280"


def upgrade():
    with op.batch_alter_table("dashboards") as batch_op:
        batch_op.alter_column(
            "json_metadata",
            existing_type=sa.Text(),
            type_=MediumText(),
            existing_nullable=True,
        )


def downgrade():
    with op.batch_alter_table("dashboards") as batch_op:
        batch_op.alter_column(
            "json_metadata",
            existing_type=MediumText(),
            type_=sa.Text(),
            existing_nullable=True,
        )
