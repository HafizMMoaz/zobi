"""security converge datasets

Revision ID: 45731db65d9c
Revises: ccb74baaa89b
Create Date: 2020-12-10 15:05:44.928020

"""

# revision identifiers, used by Alembic.
revision = "45731db65d9c"
down_revision = "c25cb2c78727"

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
    "Dataset": (
        "can_read",
        "can_write",
    )
}
PVM_MAP = {
    Pvm("SqlMetricInlineView", "can_add"): (Pvm("Dataset", "can_write"),),
    Pvm("SqlMetricInlineView", "can_delete"): (Pvm("Dataset", "can_write"),),
    Pvm("SqlMetricInlineView", "can_edit"): (Pvm("Dataset", "can_write"),),
    Pvm("SqlMetricInlineView", "can_list"): (Pvm("Dataset", "can_read"),),
    Pvm("SqlMetricInlineView", "can_show"): (Pvm("Dataset", "can_read"),),
    Pvm("TableColumnInlineView", "can_add"): (Pvm("Dataset", "can_write"),),
    Pvm("TableColumnInlineView", "can_delete"): (Pvm("Dataset", "can_write"),),
    Pvm("TableColumnInlineView", "can_edit"): (Pvm("Dataset", "can_write"),),
    Pvm("TableColumnInlineView", "can_list"): (Pvm("Dataset", "can_read"),),
    Pvm("TableColumnInlineView", "can_show"): (Pvm("Dataset", "can_read"),),
    Pvm(
        "TableModelView",
        "can_add",
    ): (Pvm("Dataset", "can_write"),),
    Pvm(
        "TableModelView",
        "can_delete",
    ): (Pvm("Dataset", "can_write"),),
    Pvm(
        "TableModelView",
        "can_edit",
    ): (Pvm("Dataset", "can_write"),),
    Pvm("TableModelView", "can_list"): (Pvm("Dataset", "can_read"),),
    Pvm("TableModelView", "can_mulexport"): (Pvm("Dataset", "can_read"),),
    Pvm("TableModelView", "can_show"): (Pvm("Dataset", "can_read"),),
    Pvm(
        "TableModelView",
        "muldelete",
    ): (Pvm("Dataset", "can_write"),),
    Pvm(
        "TableModelView",
        "refresh",
    ): (Pvm("Dataset", "can_write"),),
    Pvm(
        "TableModelView",
        "yaml_export",
    ): (Pvm("Dataset", "can_read"),),
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
