"""add rls filter type and grouping key

Revision ID: e5ef6828ac4e
Revises: ae19b4ee3692
Create Date: 2020-09-15 18:22:40.130985

"""

# revision identifiers, used by Alembic.
revision = "e5ef6828ac4e"
down_revision = "ae19b4ee3692"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402

from zobi.utils import core as utils  # noqa: E402


def upgrade():
    with op.batch_alter_table("row_level_security_filters") as batch_op:
        (batch_op.add_column(sa.Column("filter_type", sa.VARCHAR(255), nullable=True)),)
        (batch_op.add_column(sa.Column("group_key", sa.VARCHAR(255), nullable=True)),)
        batch_op.create_index(
            op.f("ix_row_level_security_filters_filter_type"),
            ["filter_type"],
            unique=False,
        )

    bind = op.get_bind()
    metadata = sa.MetaData(bind=bind)
    filters = sa.Table("row_level_security_filters", metadata, autoload=True)
    statement = filters.update().values(
        filter_type=utils.RowLevelSecurityFilterType.REGULAR.value
    )
    bind.execute(statement)


def downgrade():
    with op.batch_alter_table("row_level_security_filters") as batch_op:
        batch_op.drop_index(
            op.f("ix_row_level_security_filters_filter_type"),
        )
        batch_op.drop_column("filter_type")
        batch_op.drop_column("group_key")
