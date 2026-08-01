"""Added always_filter_main_dttm to datasource

Revision ID: 317970b4400c
Revises: ec54aca4c8a2
Create Date: 2023-09-06 13:18:59.597259

"""

# revision identifiers, used by Alembic.
revision = "317970b4400c"
down_revision = "ec54aca4c8a2"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.migrations.shared.utils import (  # noqa: E402
    paginated_update,
    table_has_column,
)

Base = declarative_base()


class SqlaTable(Base):
    __tablename__ = "tables"

    id = sa.Column(sa.Integer, primary_key=True)
    always_filter_main_dttm = sa.Column(sa.Boolean())


def upgrade():
    if not table_has_column("tables", "always_filter_main_dttm"):
        op.add_column(
            "tables",
            sa.Column(
                "always_filter_main_dttm",
                sa.Boolean(),
                nullable=True,
                default=False,
                server_default=sa.false(),
            ),
        )

        bind = op.get_bind()
        session = db.Session(bind=bind)

        for table in paginated_update(session.query(SqlaTable)):
            table.always_filter_main_dttm = False


def downgrade():
    if table_has_column("tables", "always_filter_main_dttm"):
        op.drop_column("tables", "always_filter_main_dttm")
