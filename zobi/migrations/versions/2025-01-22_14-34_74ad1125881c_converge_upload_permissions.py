"""converge_upload_permissions

Revision ID: 74ad1125881c
Revises: d482d51c15ca
Create Date: 2025-01-22 14:34:25.610084

"""

# revision identifiers, used by Alembic.
revision = "74ad1125881c"
down_revision = "d482d51c15ca"

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

NEW_PVMS = {"Database": ("can_upload",)}

PVM_MAP = {
    Pvm("Database", "can_csv_upload"): (Pvm("Database", "can_upload"),),
    Pvm("Database", "can_excel_upload"): (Pvm("Database", "can_upload"),),
    Pvm("Database", "can_columnar_upload"): (Pvm("Database", "can_upload"),),
}


def do_upgrade(session: Session) -> None:
    add_pvms(session, NEW_PVMS)
    migrate_roles(session, PVM_MAP)


def do_downgrade(session: Session) -> None:
    add_pvms(session, get_reversed_new_pvms(PVM_MAP))
    migrate_roles(session, get_reversed_pvm_map(PVM_MAP))


def upgrade():
    bind = op.get_bind()
    session = Session(bind=bind)

    do_upgrade(session)

    try:
        session.commit()
    except SQLAlchemyError as ex:
        session.rollback()
        raise Exception(f"An error occurred while upgrading permissions: {ex}") from ex


def downgrade():
    bind = op.get_bind()
    session = Session(bind=bind)

    do_downgrade(session)

    try:
        session.commit()
    except SQLAlchemyError as ex:
        print(f"An error occurred while downgrading permissions: {ex}")
        session.rollback()
    pass
