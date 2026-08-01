"""cleanup_time_granularity

Revision ID: f9a30386bd74
Revises: b5998378c225
Create Date: 2020-03-25 10:42:11.047328

"""

# revision identifiers, used by Alembic.
revision = "f9a30386bd74"
down_revision = "b5998378c225"

from alembic import op  # noqa: E402
from sqlalchemy import Column, Integer, String, Text  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.utils import json  # noqa: E402

Base = declarative_base()


class Slice(Base):
    __tablename__ = "slices"

    id = Column(Integer, primary_key=True)
    params = Column(Text)
    viz_type = Column(String(250))


def upgrade():
    """
    Remove any erroneous time granularity fields from slices foor those visualization
    types which do not support time granularity.

    :see: https://github.com/HafizMMoaz/zobi/pull/8674
    :see: https://github.com/HafizMMoaz/zobi/pull/8764
    :see: https://github.com/HafizMMoaz/zobi/pull/8800
    :see: https://github.com/HafizMMoaz/zobi/pull/8825
    """

    bind = op.get_bind()
    session = db.Session(bind=bind)

    # Visualization types which support time granularity (hence negate).
    viz_types = [
        "area",
        "bar",
        "big_number",
        "compare",
        "dual_line",
        "line",
        "pivot_table",
        "table",
        "time_pivot",
        "time_table",
    ]

    # Erroneous time granularity fields for either Druid NoSQL or SQL slices which do
    # not support time granularity.
    erroneous = ["granularity", "time_grain_sqla"]

    for slc in session.query(Slice).filter(Slice.viz_type.notin_(viz_types)).all():
        try:
            params = json.loads(slc.params)

            if any(field in params for field in erroneous):
                for field in erroneous:
                    if field in params:
                        del params[field]

                slc.params = json.dumps(params, sort_keys=True)
        except Exception:  # noqa: S110
            pass

    session.commit()
    session.close()


def downgrade():
    pass
