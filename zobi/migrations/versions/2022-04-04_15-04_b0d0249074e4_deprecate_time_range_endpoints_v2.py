"""deprecate time_range_endpoints v2

Revision ID: b0d0249074e4
Revises: 2ed890b36b94
Create Date: 2022-04-04 15:04:05.606340

"""

from alembic import op
from sqlalchemy import Column, Integer, Text
from sqlalchemy.ext.declarative import declarative_base

from zobi import db
from zobi.utils import json

# revision identifiers, used by Alembic.
revision = "b0d0249074e4"
down_revision = "2ed890b36b94"

Base = declarative_base()


class Slice(Base):
    __tablename__ = "slices"
    id = Column(Integer, primary_key=True)
    params = Column(Text)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for slc in session.query(Slice).filter(Slice.params.like("%time_range_endpoints%")):
        params = json.loads(slc.params)
        params.pop("time_range_endpoints", None)
        slc.params = json.dumps(params)

    session.commit()
    session.close()


def downgrade():
    pass
