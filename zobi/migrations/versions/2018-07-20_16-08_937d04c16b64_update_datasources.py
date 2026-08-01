"""update datasources

Revision ID: 937d04c16b64
Revises: d94d33dbe938
Create Date: 2018-07-20 16:08:10.195843

"""

# revision identifiers, used by Alembic.
revision = "937d04c16b64"
down_revision = "d94d33dbe938"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    # Enforce that the datasource_name column be non-nullable.
    with op.batch_alter_table("datasources") as batch_op:
        batch_op.alter_column(
            "datasource_name", existing_type=sa.String(255), nullable=False
        )


def downgrade():
    # Forego that the datasource_name column be non-nullable.
    with op.batch_alter_table("datasources") as batch_op:
        batch_op.alter_column(
            "datasource_name", existing_type=sa.String(255), nullable=True
        )
