"""add_execution_id_to_report_execution_log_model.py

Revision ID: 301362411006
Revises: 989bbe479899
Create Date: 2021-03-23 05:23:15.641856

"""

# revision identifiers, used by Alembic.
revision = "301362411006"
down_revision = "989bbe479899"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402
from sqlalchemy_utils import UUIDType  # noqa: E402


def upgrade():
    with op.batch_alter_table("report_execution_log") as batch_op:
        batch_op.add_column(sa.Column("uuid", UUIDType(binary=True)))


def downgrade():
    with op.batch_alter_table("report_execution_log") as batch_op:
        batch_op.drop_column("uuid")
