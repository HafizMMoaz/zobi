"""add_normalize_columns_to_sqla_model

Revision ID: 9f4a086c2676
Revises: 4448fa6deeb1
Create Date: 2023-08-14 09:38:11.897437

"""

# revision identifiers, used by Alembic.
revision = "9f4a086c2676"
down_revision = "4448fa6deeb1"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.migrations.shared.utils import paginated_update  # noqa: E402

Base = declarative_base()


class SqlaTable(Base):
    __tablename__ = "tables"

    id = sa.Column(sa.Integer, primary_key=True)
    normalize_columns = sa.Column(sa.Boolean())


def upgrade():
    op.add_column(
        "tables",
        sa.Column(
            "normalize_columns",
            sa.Boolean(),
            nullable=True,
            default=False,
            server_default=sa.false(),
        ),
    )

    bind = op.get_bind()
    session = db.Session(bind=bind)

    for table in paginated_update(session.query(SqlaTable)):
        table.normalize_columns = True


def downgrade():
    op.drop_column("tables", "normalize_columns")
