"""add_certifications_columns_to_dashboard

Revision ID: aea15018d53b
Revises: f9847149153d
Create Date: 2021-11-05 11:11:55.496618

"""

# revision identifiers, used by Alembic.
import sqlalchemy as sa
from alembic import op

revision = "aea15018d53b"
down_revision = "f9847149153d"


def upgrade():
    with op.batch_alter_table("dashboards") as batch_op:
        batch_op.add_column(sa.Column("certified_by", sa.Text(), nullable=True))
        batch_op.add_column(
            sa.Column("certification_details", sa.Text(), nullable=True)
        )


def downgrade():
    with op.batch_alter_table("dashboards") as batch_op:
        batch_op.drop_column("certified_by")
        batch_op.drop_column("certification_details")
