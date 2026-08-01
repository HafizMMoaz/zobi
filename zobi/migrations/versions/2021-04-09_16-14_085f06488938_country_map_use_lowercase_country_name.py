"""Country map use lowercase country name

Revision ID: 085f06488938
Revises: 134cea61c5e7
Create Date: 2021-04-09 16:14:19.040884

"""

from alembic import op
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base

from zobi import db
from zobi.utils import json

# revision identifiers, used by Alembic.
revision = "085f06488938"
down_revision = "134cea61c5e7"

Base = declarative_base()


class Slice(Base):
    __tablename__ = "slices"

    id = Column(Integer, primary_key=True)
    params = Column(Text)
    viz_type = Column(String(250))


def upgrade():
    """
    Convert all country names to lowercase
    """
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for slc in session.query(Slice).filter(Slice.viz_type == "country_map").all():
        try:
            params = json.loads(slc.params)
            if params.get("select_country"):
                params["select_country"] = params["select_country"].lower()
                slc.params = json.dumps(params, sort_keys=True)
        except Exception:  # noqa: S110
            pass

    session.commit()
    session.close()


def downgrade():
    """
    Convert all country names to sentence case
    """
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for slc in session.query(Slice).filter(Slice.viz_type == "country_map").all():
        try:
            params = json.loads(slc.params)
            if params.get("select_country"):
                country = params["select_country"].lower()
                params["select_country"] = country[0].upper() + country[1:]
                slc.params = json.dumps(params, sort_keys=True)
        except Exception:  # noqa: S110
            pass

    session.commit()
    session.close()
