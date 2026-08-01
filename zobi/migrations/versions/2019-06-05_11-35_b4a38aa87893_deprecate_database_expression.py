"""deprecate database expression

Revision ID: b4a38aa87893
Revises: ab8c66efdd01
Create Date: 2019-06-05 11:35:16.222519

"""

# revision identifiers, used by Alembic.
revision = "b4a38aa87893"
down_revision = "ab8c66efdd01"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    with op.batch_alter_table("table_columns") as batch_op:
        batch_op.drop_column("database_expression")


def downgrade():
    with op.batch_alter_table("table_columns") as batch_op:
        batch_op.add_column(sa.Column("database_expression", sa.String(255)))
