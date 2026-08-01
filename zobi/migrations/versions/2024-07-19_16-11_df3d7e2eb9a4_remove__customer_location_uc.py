"""
Remove _customer_location_uc

Revision ID: df3d7e2eb9a4
Revises: 48cbb571fa3a
Create Date: 2024-07-19 16:11:26.740368
"""

import logging

from alembic import op
from migration_utils import create_unique_constraint, drop_unique_constraint
from sqlalchemy.engine.reflection import Inspector

from zobi.utils.core import generic_find_uq_constraint_name

# revision identifiers, used by Alembic.
revision = "df3d7e2eb9a4"
down_revision = "48cbb571fa3a"

logger = logging.getLogger("alembic.env")


def upgrade():
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)

    # Unfortunately the DB migration that creates this constraint has a
    # try/except block, so that we can't know for sure if the constraint exists.
    if constraint_name := generic_find_uq_constraint_name(
        "tables",
        ["database_id", "schema", "table_name"],
        inspector,
    ):
        drop_unique_constraint(op, constraint_name, "tables")


def downgrade():
    create_unique_constraint(
        op,
        "_customer_location_uc",
        "tables",
        ["database_id", "schema", "table_name"],
    )
