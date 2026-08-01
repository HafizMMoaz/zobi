"""add fetch values predicate

Revision ID: 732f1c06bcbf
Revises: d6db5a5cdb5d
Create Date: 2017-03-03 09:15:56.800930

"""

# revision identifiers, used by Alembic.
revision = "732f1c06bcbf"
down_revision = "d6db5a5cdb5d"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column(
        "datasources",
        sa.Column("fetch_values_from", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "tables",
        sa.Column("fetch_values_predicate", sa.String(length=1000), nullable=True),
    )


def downgrade():
    op.drop_column("tables", "fetch_values_predicate")
    op.drop_column("datasources", "fetch_values_from")
