"""update_tag_model_w_description

Revision ID: 240d23c7f86f
Revises: 8e5b0fb85b9a
Create Date: 2023-06-29 18:38:30.033529

"""

# revision identifiers, used by Alembic.
revision = "240d23c7f86f"
down_revision = "8e5b0fb85b9a"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column("tag", sa.Column("description", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("tag", "description")
