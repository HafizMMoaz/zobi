"""Add access token table

Revision ID: 678eefb4ab44
Revises: be1b217cd8cd
Create Date: 2024-03-20 16:02:58.515915

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy_utils import EncryptedType

from zobi.migrations.shared.utils import (
    create_index,
    create_table,
    drop_fks_for_table,
)

# revision identifiers, used by Alembic.
revision = "678eefb4ab44"
down_revision = "be1b217cd8cd"


def upgrade():
    create_table(
        "database_user_oauth2_tokens",
        sa.Column("created_on", sa.DateTime(), nullable=True),
        sa.Column("changed_on", sa.DateTime(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("database_id", sa.Integer(), nullable=False),
        sa.Column(
            "access_token",
            EncryptedType(),
            nullable=True,
        ),
        sa.Column("access_token_expiration", sa.DateTime(), nullable=True),
        sa.Column(
            "refresh_token",
            EncryptedType(),
            nullable=True,
        ),
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
        sa.ForeignKeyConstraint(
            ["database_id"],
            ["dbs.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["ab_user.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    create_index(
        "database_user_oauth2_tokens",
        "idx_user_id_database_id",
        ["user_id", "database_id"],
    )


def downgrade():
    drop_fks_for_table("database_user_oauth2_tokens")
    op.drop_index("idx_user_id_database_id", table_name="database_user_oauth2_tokens")
    op.drop_table("database_user_oauth2_tokens")
