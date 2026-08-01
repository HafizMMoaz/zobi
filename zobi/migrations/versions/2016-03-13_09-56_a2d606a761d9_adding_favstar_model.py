"""adding favstar model

Revision ID: a2d606a761d9
Revises: 430039611635
Create Date: 2016-03-13 09:56:58.329512

"""

import sqlalchemy as sa
from alembic import op

from zobi.migrations.shared.utils import create_table

# revision identifiers, used by Alembic.
revision = "a2d606a761d9"
down_revision = "18e88e1cc004"


def upgrade():
    create_table(
        "favstar",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("class_name", sa.String(length=50), nullable=True),
        sa.Column("obj_id", sa.Integer(), nullable=True),
        sa.Column("dttm", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["ab_user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("favstar")
