"""add_import_mixing_to_saved_query

Revision ID: 96e99fb176a0
Revises: 585b0b1a7b18
Create Date: 2020-10-21 21:09:55.945956

"""

import os
from uuid import uuid4

import sqlalchemy as sa
from alembic import op
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy_utils import UUIDType

from zobi import db
from zobi.migrations.shared.utils import assign_uuids

# revision identifiers, used by Alembic.
revision = "96e99fb176a0"
down_revision = "585b0b1a7b18"


Base = declarative_base()


class ImportMixin:
    id = sa.Column(sa.Integer, primary_key=True)
    uuid = sa.Column(UUIDType(binary=True), primary_key=False, default=uuid4)


class SavedQuery(ImportMixin, Base):
    __tablename__ = "saved_query"


default_batch_size = int(os.environ.get("BATCH_SIZE", 200))


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    # Add uuid column
    try:
        with op.batch_alter_table("saved_query") as batch_op:
            batch_op.add_column(
                sa.Column(
                    "uuid",
                    UUIDType(binary=True),
                    primary_key=False,
                    default=uuid4,
                ),
            )
    except OperationalError:
        # Ignore column update errors so that we can run upgrade multiple times
        pass

    assign_uuids(SavedQuery, session)

    try:
        # Add uniqueness constraint
        with op.batch_alter_table("saved_query") as batch_op:
            # Batch mode is required for sqlite
            batch_op.create_unique_constraint("uq_saved_query_uuid", ["uuid"])
    except OperationalError:
        pass


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)  # noqa: F841

    # Remove uuid column
    with op.batch_alter_table("saved_query") as batch_op:
        batch_op.drop_constraint("uq_saved_query_uuid", type_="unique")
        batch_op.drop_column("uuid")
