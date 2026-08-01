"""add granular export permissions

Revision ID: a1b2c3d4e5f6
Revises: 4b2a8c9d3e1f
Create Date: 2026-03-02 12:00:00.000000

"""

# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = "4b2a8c9d3e1f"

from alembic import op  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from zobi.migrations.shared.security_converge import (  # noqa: E402
    add_pvms,
    get_reversed_new_pvms,
    get_reversed_pvm_map,
    migrate_roles,
    Pvm,
)

NEW_PVMS = {
    "Zobi": (
        "can_export_data",
        "can_export_image",
        "can_copy_clipboard",
    )
}

PVM_MAP = {
    Pvm("Zobi", "can_csv"): (
        Pvm("Zobi", "can_export_data"),
        Pvm("Zobi", "can_export_image"),
        Pvm("Zobi", "can_copy_clipboard"),
    ),
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


def downgrade():
    bind = op.get_bind()
    session = Session(bind=bind)
    do_downgrade(session)
