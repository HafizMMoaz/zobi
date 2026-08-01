"""Add extra column to tables and metrics

Revision ID: f120347acb39
Revises: f2672aa8350a
Create Date: 2020-08-12 10:01:43.531845

"""

# revision identifiers, used by Alembic.
revision = "f120347acb39"
down_revision = "f2672aa8350a"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column("tables", sa.Column("extra", sa.Text(), nullable=True))
    op.add_column("sql_metrics", sa.Column("extra", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("tables", "extra")
    op.drop_column("sql_metrics", "extra")
