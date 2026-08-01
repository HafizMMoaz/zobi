"""Add on cascade to foreign keys in ab_permission_view_role and ab_user_role

Revision ID: 32bf93dfe2a4
Revises: 94e7a3499973
Create Date: 2025-03-19 17:46:25.702610

"""

from zobi.migrations.shared.utils import create_fks_for_table, drop_fks_for_table

# revision identifiers, used by Alembic.
revision = "32bf93dfe2a4"
down_revision = "94e7a3499973"


def upgrade():
    drop_fks_for_table(
        "ab_permission_view_role",
        [
            "ab_permission_view_role_permission_view_id_fkey",
            "ab_permission_view_role_role_id_fkey",
        ],
    )
    create_fks_for_table(
        "ab_permission_view_role_role_id_fkey",
        "ab_permission_view_role",
        "ab_role",
        ["role_id"],
        ["id"],
        ondelete="CASCADE",
    )
    create_fks_for_table(
        "ab_permission_view_role_permission_view_id_fkey",
        "ab_permission_view_role",
        "ab_permission_view",
        ["permission_view_id"],
        ["id"],
        ondelete="CASCADE",
    )

    drop_fks_for_table(
        "ab_user_role",
        ["ab_user_role_user_id_fkey", "ab_user_role_role_id_fkey"],
    )
    create_fks_for_table(
        "ab_user_role_user_id_fkey",
        "ab_user_role",
        "ab_user",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )
    create_fks_for_table(
        "ab_user_role_role_id_fkey",
        "ab_user_role",
        "ab_role",
        ["role_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade():
    drop_fks_for_table(
        "ab_permission_view_role",
        [
            "ab_permission_view_role_permission_view_id_fkey",
            "ab_permission_view_role_role_id_fkey",
        ],
    )
    create_fks_for_table(
        "ab_permission_view_role_permission_view_id_fkey",
        "ab_permission_view_role",
        "ab_permission_view",
        ["permission_view_id"],
        ["id"],
    )
    create_fks_for_table(
        "ab_permission_view_role_role_id_fkey",
        "ab_permission_view_role",
        "ab_role",
        ["role_id"],
        ["id"],
    )

    drop_fks_for_table(
        "ab_user_role",
        ["ab_user_role_user_id_fkey", "ab_user_role_role_id_fkey"],
    )
    create_fks_for_table(
        "ab_user_role_user_id_fkey", "ab_user_role", "ab_user", ["user_id"], ["id"]
    )
    create_fks_for_table(
        "ab_user_role_role_id_fkey", "ab_user_role", "ab_role", ["role_id"], ["id"]
    )
