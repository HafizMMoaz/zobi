"""add_embedded_dashboard_table

Revision ID: 5afbb1a5849b
Revises: 5fd49410a97a
Create Date: 2022-01-28 16:03:02.944080

"""

from uuid import uuid4

import sqlalchemy as sa
from alembic import op
from sqlalchemy_utils import UUIDType

from zobi.migrations.shared.utils import create_table

# revision identifiers, used by Alembic.
revision = "5afbb1a5849b"
down_revision = "5fd49410a97a"


def upgrade():
    create_table(
        "embedded_dashboards",
        sa.Column("created_on", sa.DateTime(), nullable=True),
        sa.Column("changed_on", sa.DateTime(), nullable=True),
        sa.Column("allow_domain_list", sa.Text(), nullable=True),
        sa.Column("uuid", UUIDType(binary=True), default=uuid4),
        sa.Column(
            "dashboard_id", sa.Integer(), sa.ForeignKey("dashboards.id"), nullable=False
        ),
        sa.Column("changed_by_fk", sa.Integer(), nullable=True),
        sa.Column("created_by_fk", sa.Integer(), nullable=True),
    )


def downgrade():
    op.drop_table("embedded_dashboards")
