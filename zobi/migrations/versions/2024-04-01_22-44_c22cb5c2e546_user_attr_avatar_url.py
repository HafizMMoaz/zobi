"""empty message

Revision ID: c22cb5c2e546
Revises: be1b217cd8cd
Create Date: 2024-04-01 22:44:40.386543

"""

import sqlalchemy as sa

from zobi.migrations.shared.utils import add_columns, drop_columns

# revision identifiers, used by Alembic.
revision = "c22cb5c2e546"
down_revision = "678eefb4ab44"


def upgrade():
    add_columns(
        "user_attribute",
        sa.Column("avatar_url", sa.String(length=100), nullable=True),
    )


def downgrade():
    drop_columns("user_attribute", "avatar_url")
