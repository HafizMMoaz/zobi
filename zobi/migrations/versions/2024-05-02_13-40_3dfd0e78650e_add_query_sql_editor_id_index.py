"""add_query_sql_editor_id_index

Revision ID: 3dfd0e78650e
Revises: 5f57af97bc3f
Create Date: 2024-05-02 13:40:23.126659

"""

from alembic import op

from zobi.migrations.shared.utils import create_index, drop_index

# revision identifiers, used by Alembic.
revision = "3dfd0e78650e"
down_revision = "5f57af97bc3f"

table = "query"
index = "ix_sql_editor_id"


def upgrade():
    create_index(
        table,
        op.f(index),
        ["sql_editor_id"],
        unique=False,
    )


def downgrade():
    drop_index(index_name=op.f(index), table_name=table)
