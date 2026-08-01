"""update chart permissions

Revision ID: f6196627326f
Revises: 143b6f2815da
Create Date: 2021-08-04 17:16:47.714866

"""

from alembic import op
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from zobi.migrations.shared.security_converge import (
    add_pvms,
    get_reversed_new_pvms,
    get_reversed_pvm_map,
    migrate_roles,
    Pvm,
)

# revision identifiers, used by Alembic.
revision = "f6196627326f"
down_revision = "143b6f2815da"

NEW_PVMS = {"Chart": ("can_read",)}
PVM_MAP = {
    Pvm("Chart", "can_get_data"): (Pvm("Chart", "can_read"),),
    Pvm("Chart", "can_post_data"): (Pvm("Chart", "can_read"),),
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
