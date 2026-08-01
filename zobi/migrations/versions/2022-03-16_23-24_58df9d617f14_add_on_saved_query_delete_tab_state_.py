"""add_on_saved_query_delete_tab_state_null_constraint"

Revision ID: 58df9d617f14
Revises: 6766938c6065
Create Date: 2022-03-16 23:24:40.278937

"""

# revision identifiers, used by Alembic.
revision = "58df9d617f14"
down_revision = "6766938c6065"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402

from zobi.utils.core import generic_find_fk_constraint_name  # noqa: E402


def upgrade():
    bind = op.get_bind()
    insp = sa.engine.reflection.Inspector.from_engine(bind)

    with op.batch_alter_table("tab_state") as batch_op:
        batch_op.drop_constraint(
            generic_find_fk_constraint_name("tab_state", {"id"}, "saved_query", insp),
            type_="foreignkey",
        )

        batch_op.create_foreign_key(
            "saved_query_id",
            "saved_query",
            ["saved_query_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade():
    bind = op.get_bind()
    insp = sa.engine.reflection.Inspector.from_engine(bind)

    with op.batch_alter_table("tab_state") as batch_op:
        batch_op.drop_constraint(
            generic_find_fk_constraint_name("tab_state", {"id"}, "saved_query", insp),
            type_="foreignkey",
        )

        batch_op.create_foreign_key(
            "saved_query_id",
            "saved_query",
            ["saved_query_id"],
            ["id"],
        )
