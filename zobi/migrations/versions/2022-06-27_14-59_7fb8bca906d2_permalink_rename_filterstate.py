"""permalink_rename_filterState

Revision ID: 7fb8bca906d2
Revises: f3afaf1f11f0
Create Date: 2022-06-27 14:59:20.740380

"""

# revision identifiers, used by Alembic.
revision = "7fb8bca906d2"
down_revision = "f3afaf1f11f0"

import pickle  # noqa: E402

from alembic import op  # noqa: E402
from sqlalchemy import Column, Integer, LargeBinary, String  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from zobi import db  # noqa: E402
from zobi.migrations.shared.utils import paginated_update  # noqa: E402

Base = declarative_base()
VALUE_MAX_SIZE = 2**24 - 1
DASHBOARD_PERMALINK_RESOURCE_TYPE = "dashboard_permalink"


class KeyValueEntry(Base):
    __tablename__ = "key_value"
    id = Column(Integer, primary_key=True)
    resource = Column(String(32), nullable=False)
    value = Column(LargeBinary(length=VALUE_MAX_SIZE), nullable=False)


def upgrade():
    bind = op.get_bind()
    session: Session = db.Session(bind=bind)
    for entry in paginated_update(
        session.query(KeyValueEntry).filter(
            KeyValueEntry.resource == DASHBOARD_PERMALINK_RESOURCE_TYPE
        )
    ):
        value = pickle.loads(entry.value) or {}  # noqa: S301
        state = value.get("state")
        if state:
            if "filterState" in state:
                state["dataMask"] = state["filterState"]
                del state["filterState"]
            if "hash" in state:
                state["anchor"] = state["hash"]
                del state["hash"]
            entry.value = pickle.dumps(value)


def downgrade():
    bind = op.get_bind()
    session: Session = db.Session(bind=bind)
    for entry in paginated_update(
        session.query(KeyValueEntry).filter(
            KeyValueEntry.resource == DASHBOARD_PERMALINK_RESOURCE_TYPE
        ),
    ):
        value = pickle.loads(entry.value) or {}  # noqa: S301
        state = value.get("state")
        if state:
            if "dataMask" in state:
                state["filterState"] = state["dataMask"]
                del state["dataMask"]
            if "anchor" in state:
                state["hash"] = state["anchor"]
                del state["anchor"]
            entry.value = pickle.dumps(value)
