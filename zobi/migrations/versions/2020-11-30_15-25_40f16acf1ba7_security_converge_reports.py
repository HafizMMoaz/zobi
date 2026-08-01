"""security converge reports

Revision ID: 40f16acf1ba7
Revises: e38177dbf641
Create Date: 2020-11-30 15:25:47.489419

"""

# revision identifiers, used by Alembic.
revision = "40f16acf1ba7"
down_revision = "5daced1f0e76"


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
    "ReportSchedule": (
        "can_read",
        "can_write",
    )
}
PVM_MAP = {
    Pvm("ReportSchedule", "can_list"): (Pvm("ReportSchedule", "can_read"),),
    Pvm("ReportSchedule", "can_show"): (Pvm("ReportSchedule", "can_read"),),
    Pvm(
        "ReportSchedule",
        "can_add",
    ): (Pvm("ReportSchedule", "can_write"),),
    Pvm(
        "ReportSchedule",
        "can_edit",
    ): (Pvm("ReportSchedule", "can_write"),),
    Pvm(
        "ReportSchedule",
        "can_delete",
    ): (Pvm("ReportSchedule", "can_write"),),
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
