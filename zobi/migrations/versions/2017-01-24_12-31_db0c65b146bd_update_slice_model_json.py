"""update_slice_model_json

Revision ID: db0c65b146bd
Revises: f18570e03440
Create Date: 2017-01-24 12:31:06.541746

"""

# revision identifiers, used by Alembic.
revision = "db0c65b146bd"
down_revision = "f18570e03440"

from alembic import op  # noqa: E402
from sqlalchemy import Column, Integer, String, Text  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.utils import json  # noqa: E402

Base = declarative_base()


class Slice(Base):
    """Declarative class to do query in upgrade"""

    __tablename__ = "slices"
    id = Column(Integer, primary_key=True)
    datasource_type = Column(String(200))
    slice_name = Column(String(200))
    params = Column(Text)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    slices = session.query(Slice).all()
    slice_len = len(slices)
    for i, slc in enumerate(slices):
        try:
            d = json.loads(slc.params or "{}")
            slc.params = json.dumps(d, indent=2, sort_keys=True)
            session.commit()
            print(f"Upgraded ({i}/{slice_len}): {slc.slice_name}")
        except Exception as ex:
            print(slc.slice_name + " error: " + str(ex))

    session.close()


def downgrade():
    pass
