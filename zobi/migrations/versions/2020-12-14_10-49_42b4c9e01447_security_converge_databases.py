"""security converge databases

Revision ID: 42b4c9e01447
Revises: 5daced1f0e76
Create Date: 2020-12-14 10:49:36.110805

"""

# revision identifiers, used by Alembic.
revision = "42b4c9e01447"
down_revision = "1f6dca87d1a2"

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
    "Database": (
        "can_read",
        "can_write",
    )
}
PVM_MAP = {
    Pvm("DatabaseView", "can_add"): (Pvm("Database", "can_write"),),
    Pvm("DatabaseView", "can_delete"): (Pvm("Database", "can_write"),),
    Pvm(
        "DatabaseView",
        "can_edit",
    ): (Pvm("Database", "can_write"),),
    Pvm(
        "DatabaseView",
        "can_list",
    ): (Pvm("Database", "can_read"),),
    Pvm(
        "DatabaseView",
        "can_mulexport",
    ): (Pvm("Database", "can_read"),),
    Pvm(
        "DatabaseView",
        "can_post",
    ): (Pvm("Database", "can_write"),),
    Pvm(
        "DatabaseView",
        "can_show",
    ): (Pvm("Database", "can_read"),),
    Pvm(
        "DatabaseView",
        "muldelete",
    ): (Pvm("Database", "can_write"),),
    Pvm(
        "DatabaseView",
        "yaml_export",
    ): (Pvm("Database", "can_read"),),
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
