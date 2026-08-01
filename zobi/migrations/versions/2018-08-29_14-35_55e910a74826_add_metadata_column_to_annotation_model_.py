"""add_metadata_column_to_annotation_model.py

Revision ID: 55e910a74826
Revises: 1a1d627ebd8e
Create Date: 2018-08-29 14:35:20.407743

"""

# revision identifiers, used by Alembic.
revision = "55e910a74826"
down_revision = "1a1d627ebd8e"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.add_column("annotation", sa.Column("json_metadata", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("annotation", "json_metadata")
