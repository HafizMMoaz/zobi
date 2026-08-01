"""Delete table_name unique constraint in mysql

Revision ID: 18532d70ab98
Revises: 3fbbc6e8d654
Create Date: 2020-09-25 10:56:13.711182

"""

# revision identifiers, used by Alembic.
revision = "18532d70ab98"
down_revision = "3fbbc6e8d654"

from alembic import op  # noqa: E402
from sqlalchemy.dialects.mysql.base import MySQLDialect  # noqa: E402
from sqlalchemy.engine.reflection import Inspector  # noqa: E402

from zobi.utils.core import generic_find_uq_constraint_name  # noqa: E402


def upgrade():
    bind = op.get_bind()

    # Uniqueness constraint if present only exists in MySQL.
    if isinstance(bind.dialect, MySQLDialect):
        constraint_name = generic_find_uq_constraint_name(
            "tables", {"table_name"}, Inspector.from_engine(bind)
        )

        if constraint_name:
            op.drop_constraint(constraint_name, "tables", type_="unique")


def downgrade():
    pass
