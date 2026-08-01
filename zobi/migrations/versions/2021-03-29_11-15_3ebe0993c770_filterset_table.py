"""add filter set model

Revision ID: 3ebe0993c770
Revises: 07071313dd52
Create Date: 2021-03-29 11:15:48.831225

"""

import sqlalchemy as sa
from alembic import op

from zobi.migrations.shared.utils import create_table

# revision identifiers, used by Alembic.
revision = "3ebe0993c770"
down_revision = "181091c0ef16"


def upgrade():
    create_table(
        "filter_sets",
        sa.Column("created_on", sa.DateTime(), nullable=True),
        sa.Column("changed_on", sa.DateTime(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.VARCHAR(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("json_metadata", sa.Text(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("owner_type", sa.VARCHAR(255), nullable=False),
        sa.Column(
            "dashboard_id", sa.Integer(), sa.ForeignKey("dashboards.id"), nullable=False
        ),
        sa.Column("created_by_fk", sa.Integer(), nullable=True),
        sa.Column("changed_by_fk", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["changed_by_fk"], ["ab_user.id"]),
        sa.ForeignKeyConstraint(["created_by_fk"], ["ab_user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("filter_sets")
