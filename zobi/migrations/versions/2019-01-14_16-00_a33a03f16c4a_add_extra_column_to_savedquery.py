# revision identifiers, used by Alembic.
revision = "a33a03f16c4a"
down_revision = "fb13d49b72f9"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    with op.batch_alter_table("saved_query") as batch_op:
        batch_op.add_column(sa.Column("extra_json", sa.Text(), nullable=True))


def downgrade():
    with op.batch_alter_table("saved_query") as batch_op:
        batch_op.drop_column("extra_json")
