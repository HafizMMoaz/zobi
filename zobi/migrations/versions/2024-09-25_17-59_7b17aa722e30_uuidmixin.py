"""UUIDMixin

Revision ID: 7b17aa722e30
Revises: 48cbb571fa3a
Create Date: 2024-09-25 17:59:21.028426

"""

import sqlalchemy as sa
import sqlalchemy_utils

from zobi.migrations.shared.utils import add_columns, drop_columns

# revision identifiers, used by Alembic.
revision = "7b17aa722e30"
down_revision = "48cbb571fa3a"


def upgrade():
    add_columns(
        "css_templates",
        sa.Column("uuid", sqlalchemy_utils.types.uuid.UUIDType(), nullable=True),
    )
    add_columns(
        "favstar",
        sa.Column("uuid", sqlalchemy_utils.types.uuid.UUIDType(), nullable=True),
    )


def downgrade():
    drop_columns("css_templates", "uuid")
    drop_columns("favstar", "uuid")
