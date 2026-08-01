"""add_dynamic_plugins.py

Revision ID: 73fd22e742ab
Revises: 0a6f12f60c73
Create Date: 2020-07-09 17:12:00.686702

"""

# revision identifiers, used by Alembic.
revision = "73fd22e742ab"
down_revision = "ab104a954a8f"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402


def upgrade():
    op.create_table(
        "dynamic_plugin",
        sa.Column("created_on", sa.DateTime(), nullable=True),
        sa.Column("changed_on", sa.DateTime(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("key", sa.String(length=50), nullable=False),
        sa.Column("bundle_url", sa.String(length=1000), nullable=False),
        sa.Column("created_by_fk", sa.Integer(), nullable=True),
        sa.Column("changed_by_fk", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["changed_by_fk"],
            ["ab_user.id"],
        ),
        sa.ForeignKeyConstraint(
            ["created_by_fk"],
            ["ab_user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key"),
        sa.UniqueConstraint("name"),
    )


def downgrade():
    op.drop_table("dynamic_plugin")
