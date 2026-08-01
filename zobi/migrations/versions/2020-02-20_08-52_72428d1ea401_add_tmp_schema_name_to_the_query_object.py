"""Add tmp_schema_name to the query object.

Revision ID: 72428d1ea401
Revises: 0a6f12f60c73
Create Date: 2020-02-20 08:52:22.877902

"""

# revision identifiers, used by Alembic.
revision = "72428d1ea401"
down_revision = "0a6f12f60c73"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column(
        "query", sa.Column("tmp_schema_name", sa.String(length=256), nullable=True)
    )


def downgrade():
    try:
        # sqlite doesn't like dropping the columns
        op.drop_column("query", "tmp_schema_name")
    except Exception:  # noqa: S110
        pass
