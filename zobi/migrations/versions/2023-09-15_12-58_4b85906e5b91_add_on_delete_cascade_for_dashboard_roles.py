"""add on delete cascade for dashboard_roles

Revision ID: 4b85906e5b91
Revises: 317970b4400c
Create Date: 2023-09-15 12:58:26.772759

"""

# revision identifiers, used by Alembic.
revision = "4b85906e5b91"
down_revision = "317970b4400c"


from zobi.migrations.shared.constraints import ForeignKey, redefine  # noqa: E402

foreign_keys = [
    ForeignKey(
        table="dashboard_roles",
        referent_table="dashboards",
        local_cols=["dashboard_id"],
        remote_cols=["id"],
    ),
    ForeignKey(
        table="dashboard_roles",
        referent_table="ab_role",
        local_cols=["role_id"],
        remote_cols=["id"],
    ),
]


def upgrade():
    for foreign_key in foreign_keys:
        redefine(foreign_key, on_delete="CASCADE")


def downgrade():
    for foreign_key in foreign_keys:
        redefine(foreign_key)
