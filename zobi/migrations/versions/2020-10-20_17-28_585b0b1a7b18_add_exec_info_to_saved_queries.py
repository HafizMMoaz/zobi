"""add exec info to saved queries

Revision ID: 585b0b1a7b18
Revises: af30ca79208f
Create Date: 2020-10-20 17:28:22.857694

"""

# revision identifiers, used by Alembic.
revision = "585b0b1a7b18"
down_revision = "af30ca79208f"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column("saved_query", sa.Column("last_run", sa.DateTime(), nullable=True))
    op.add_column("saved_query", sa.Column("rows", sa.Integer(), nullable=True))


def downgrade():
    op.drop_column("saved_query", "rows")
    op.drop_column("saved_query", "last_run")
