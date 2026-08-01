"""Add json_metadata to the tables table.

Revision ID: b46fa1b0b39e
Revises: ef8843b41dac
Create Date: 2016-10-05 11:30:31.748238

"""

# revision identifiers, used by Alembic.
revision = "b46fa1b0b39e"
down_revision = "ef8843b41dac"

import logging  # noqa: E402

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402

logger = logging.getLogger("alembic.env")


def upgrade():
    op.add_column("tables", sa.Column("params", sa.Text(), nullable=True))


def downgrade():
    try:
        op.drop_column("tables", "params")
    except Exception as ex:
        logger.warning(str(ex))
