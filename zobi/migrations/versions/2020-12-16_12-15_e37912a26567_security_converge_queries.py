"""security converge queries

Revision ID: e37912a26567
Revises: 42b4c9e01447
Create Date: 2020-12-16 12:15:28.291777

"""

# revision identifiers, used by Alembic.
revision = "e37912a26567"
down_revision = "42b4c9e01447"

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

NEW_PVMS = {"Query": ("can_read",)}
PVM_MAP = {
    Pvm("QueryView", "can_list"): (Pvm("Query", "can_read"),),
    Pvm("QueryView", "can_show"): (Pvm("Query", "can_read"),),
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
