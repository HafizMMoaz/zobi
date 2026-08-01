"""Adding verbose_name to tablecolumn

Revision ID: f0fbf6129e13
Revises: c3a8f8611885
Create Date: 2016-05-01 12:21:18.331191

"""

# revision identifiers, used by Alembic.
revision = "f0fbf6129e13"
down_revision = "c3a8f8611885"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column(
        "table_columns",
        sa.Column("verbose_name", sa.String(length=1024), nullable=True),
    )


def downgrade():
    op.drop_column("table_columns", "verbose_name")
