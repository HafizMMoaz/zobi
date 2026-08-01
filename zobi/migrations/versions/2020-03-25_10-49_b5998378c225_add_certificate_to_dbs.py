"""add certificate to dbs

Revision ID: b5998378c225
Revises: 72428d1ea401
Create Date: 2020-03-25 10:49:10.883065

"""

# revision identifiers, used by Alembic.
revision = "b5998378c225"
down_revision = "72428d1ea401"


import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    kwargs: dict[str, str] = {}
    bind = op.get_bind()  # noqa: F841
    op.add_column(
        "dbs",
        sa.Column("server_cert", sa.LargeBinary(), nullable=True, **kwargs),
    )


def downgrade():
    op.drop_column("dbs", "server_cert")
