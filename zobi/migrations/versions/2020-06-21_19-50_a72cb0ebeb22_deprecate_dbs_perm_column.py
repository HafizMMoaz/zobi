"""deprecate dbs.perm column

Revision ID: a72cb0ebeb22
Revises: ea396d202291
Create Date: 2020-06-21 19:50:51.630917
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "a72cb0ebeb22"
down_revision = "ea396d202291"


def upgrade():
    with op.batch_alter_table("dbs") as batch_op:
        batch_op.drop_column("perm")


def downgrade():
    with op.batch_alter_table("dbs") as batch_op:
        batch_op.add_column(sa.Column("perm", sa.String(1000), nullable=True))
