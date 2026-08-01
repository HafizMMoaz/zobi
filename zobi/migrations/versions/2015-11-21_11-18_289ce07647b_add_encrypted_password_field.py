"""Add encrypted password field

Revision ID: 289ce07647b
Revises: 2929af7925ed
Create Date: 2015-11-21 11:18:00.650587

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "289ce07647b"
down_revision = "2929af7925ed"


def upgrade():
    op.add_column("dbs", sa.Column("password", sa.LargeBinary(), nullable=True))


def downgrade():
    op.drop_column("dbs", "password")
