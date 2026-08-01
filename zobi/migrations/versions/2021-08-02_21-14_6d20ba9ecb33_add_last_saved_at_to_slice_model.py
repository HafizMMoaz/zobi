"""add_last_saved_at_to_slice_model

Revision ID: 6d20ba9ecb33
Revises: 'f6196627326f'
Create Date: 2021-08-02 21:14:58.200438

"""

# revision identifiers, used by Alembic.
revision = "6d20ba9ecb33"
down_revision = "f6196627326f"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    with op.batch_alter_table("slices") as batch_op:
        batch_op.add_column(sa.Column("last_saved_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("last_saved_by_fk", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "slices_last_saved_by_fk", "ab_user", ["last_saved_by_fk"], ["id"]
        )

    # now do data migration, copy values from changed_on and changed_by
    slices_table = sa.Table(
        "slices",
        sa.MetaData(),
        sa.Column("changed_on", sa.DateTime(), nullable=True),
        sa.Column("changed_by_fk", sa.Integer(), nullable=True),
        sa.Column("last_saved_at", sa.DateTime(), nullable=True),
        sa.Column("last_saved_by_fk", sa.Integer(), nullable=True),
    )
    conn = op.get_bind()
    conn.execute(
        slices_table.update().values(
            last_saved_at=slices_table.c.changed_on,
            last_saved_by_fk=slices_table.c.changed_by_fk,
        )
    )
    # ### end Alembic commands ###


def downgrade():
    with op.batch_alter_table("slices") as batch_op:
        batch_op.drop_constraint("slices_last_saved_by_fk", type_="foreignkey")
        batch_op.drop_column("last_saved_by_fk")
        batch_op.drop_column("last_saved_at")
    # ### end Alembic commands ###
