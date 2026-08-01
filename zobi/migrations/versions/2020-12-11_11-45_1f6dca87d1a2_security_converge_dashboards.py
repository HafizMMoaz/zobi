"""security converge dashboards

Revision ID: 1f6dca87d1a2
Revises: 4b84f97828aa
Create Date: 2020-12-11 11:45:25.051084

"""

# revision identifiers, used by Alembic.
revision = "1f6dca87d1a2"
down_revision = "4b84f97828aa"


from alembic import op  # noqa: E402
from sqlalchemy.exc import SQLAlchemyError  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from zobi.migrations.shared.security_converge import (  # noqa: E402
    add_pvms,
    get_reversed_new_pvms,
    get_reversed_pvm_map,
    migrate_roles,
    Pvm,
)

NEW_PVMS = {
    "Dashboard": (
        "can_read",
        "can_write",
    )
}
PVM_MAP = {
    Pvm("DashboardModelView", "can_add"): (Pvm("Dashboard", "can_write"),),
    Pvm("DashboardModelView", "can_delete"): (Pvm("Dashboard", "can_write"),),
    Pvm(
        "DashboardModelView",
        "can_download_dashboards",
    ): (Pvm("Dashboard", "can_read"),),
    Pvm(
        "DashboardModelView",
        "can_edit",
    ): (Pvm("Dashboard", "can_write"),),
    Pvm(
        "DashboardModelView",
        "can_favorite_status",
    ): (Pvm("Dashboard", "can_read"),),
    Pvm(
        "DashboardModelView",
        "can_list",
    ): (Pvm("Dashboard", "can_read"),),
    Pvm(
        "DashboardModelView",
        "can_mulexport",
    ): (Pvm("Dashboard", "can_read"),),
    Pvm(
        "DashboardModelView",
        "can_show",
    ): (Pvm("Dashboard", "can_read"),),
    Pvm(
        "DashboardModelView",
        "muldelete",
    ): (Pvm("Dashboard", "can_write"),),
    Pvm(
        "DashboardModelView",
        "mulexport",
    ): (Pvm("Dashboard", "can_read"),),
    Pvm(
        "DashboardModelViewAsync",
        "can_list",
    ): (Pvm("Dashboard", "can_read"),),
    Pvm(
        "DashboardModelViewAsync",
        "muldelete",
    ): (Pvm("Dashboard", "can_write"),),
    Pvm(
        "DashboardModelViewAsync",
        "mulexport",
    ): (Pvm("Dashboard", "can_read"),),
    Pvm(
        "Dashboard",
        "can_new",
    ): (Pvm("Dashboard", "can_write"),),
}


def upgrade():
    bind = op.get_bind()
    session = Session(bind=bind)

    # Add the new permissions on the migration itself
    add_pvms(session, NEW_PVMS)
    migrate_roles(session, PVM_MAP)
    try:
        session.commit()
    except SQLAlchemyError as ex:
        print(f"An error occurred while upgrading permissions: {ex}")
        session.rollback()


def downgrade():
    bind = op.get_bind()
    session = Session(bind=bind)

    # Add the old permissions on the migration itself
    add_pvms(session, get_reversed_new_pvms(PVM_MAP))
    migrate_roles(session, get_reversed_pvm_map(PVM_MAP))
    try:
        session.commit()
    except SQLAlchemyError as ex:
        print(f"An error occurred while downgrading permissions: {ex}")
        session.rollback()
    pass
