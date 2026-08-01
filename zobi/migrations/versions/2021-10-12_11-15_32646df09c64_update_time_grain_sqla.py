"""update time grain SQLA

Revision ID: 32646df09c64
Revises: 60dc453f4e2e
Create Date: 2021-10-12 11:15:25.559532

"""

# revision identifiers, used by Alembic.
revision = "32646df09c64"
down_revision = "60dc453f4e2e"

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


def migrate(mapping: dict[str, str]) -> None:
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for slc in session.query(Slice).all():
        try:
            params = json.loads(slc.params)
            time_grain_sqla = params.get("time_grain_sqla")

            if time_grain_sqla in mapping:
                params["time_grain_sqla"] = mapping[time_grain_sqla]
                slc.params = json.dumps(params, sort_keys=True)
        except Exception:  # noqa: S110
            pass

    session.commit()
    session.close()


def upgrade():
    migrate(mapping={"PT0.5H": "PT30M", "P0.25Y": "P3M"})


def downgrade():
    migrate(mapping={"PT30M": "PT0.5H", "P3M": "P0.25Y"})
