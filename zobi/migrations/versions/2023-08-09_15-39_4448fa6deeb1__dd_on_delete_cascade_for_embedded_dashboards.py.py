"""add on delete cascade for embedded_dashboards

Revision ID: 4448fa6deeb1
Revises: 8ace289026f3
Create Date: 2023-08-09 15:39:58.130228

"""

# revision identifiers, used by Alembic.
revision = "4448fa6deeb1"
down_revision = "8ace289026f3"

from zobi.migrations.shared.constraints import ForeignKey, redefine  # noqa: E402

foreign_keys = [
    ForeignKey(
        table="embedded_dashboards",
        referent_table="dashboards",
        local_cols=["dashboard_id"],
        remote_cols=["id"],
    ),
]


def upgrade():
    for foreign_key in foreign_keys:
        redefine(foreign_key, on_delete="CASCADE")


def downgrade():
    for foreign_key in foreign_keys:
        redefine(foreign_key)
