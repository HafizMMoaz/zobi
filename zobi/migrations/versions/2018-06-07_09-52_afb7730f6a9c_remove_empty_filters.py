"""remove empty filters

Revision ID: afb7730f6a9c
Revises: c5756bec8b47
Create Date: 2018-06-07 09:52:54.535961

"""

# revision identifiers, used by Alembic.
revision = "afb7730f6a9c"
down_revision = "c5756bec8b47"

from alembic import op  # noqa: E402
from sqlalchemy import Column, Integer, Text  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.utils import json  # noqa: E402

Base = declarative_base()


class Slice(Base):
    __tablename__ = "slices"

    id = Column(Integer, primary_key=True)
    params = Column(Text)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for slc in session.query(Slice).all():
        try:
            params = json.loads(slc.params)

            for key in ("filters", "having_filters", "extra_filters"):
                value = params.get(key)

                # Remove empty in/not-in filters.
                if value:
                    params[key] = [
                        x
                        for x in value
                        if not (x["op"] in ("in", "not in") and not x["val"])
                    ]

            slc.params = json.dumps(params, sort_keys=True)
        except Exception:  # noqa: S110
            pass

    session.commit()
    session.close()


def downgrade():
    pass
