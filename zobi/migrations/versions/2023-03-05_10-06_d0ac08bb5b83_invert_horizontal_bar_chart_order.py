"""invert_horizontal_bar_chart_order

Revision ID: d0ac08bb5b83
Revises: c0a3ea245b61
Create Date: 2023-03-05 10:06:23.250310

"""

# revision identifiers, used by Alembic.
revision = "d0ac08bb5b83"
down_revision = "c0a3ea245b61"

from alembic import op  # noqa: E402
from sqlalchemy import and_, Column, Integer, String, Text  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.utils import json  # noqa: E402

Base = declarative_base()

ORIENTATION = "horizontal"
CHART_TYPE = "echarts_timeseries_bar"


class Slice(Base):
    """Declarative class to do query in upgrade"""

    __tablename__ = "slices"
    id = Column(Integer, primary_key=True)
    viz_type = Column(String(250))
    params = Column(Text)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    slices = (
        session.query(Slice)
        .filter(
            and_(
                Slice.viz_type == CHART_TYPE,
                Slice.params.like("%x_axis_sort%"),
                Slice.params.like("%x_axis_sort_asc%"),
                Slice.params.like(f"%{ORIENTATION}%"),
            )
        )
        .all()
    )
    changes = 0
    for slc in slices:
        try:
            params = json.loads(slc.params)
            orientation = params.get("orientation")
            x_axis_sort = params.get("x_axis_sort")
            x_axis_sort_asc = params.get("x_axis_sort_asc", None)
            if orientation == ORIENTATION and x_axis_sort:
                changes += 1
                params["x_axis_sort_asc"] = not x_axis_sort_asc
                slc.params = json.dumps(params, sort_keys=True)
        except Exception as e:
            print(e)
            print(f"Parsing params for slice {slc.id} failed.")
            pass

    session.commit()
    session.close()
    if changes:
        print(f"Updated {changes} bar chart sort orders.")


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    slices = (
        session.query(Slice)
        .filter(
            and_(
                Slice.viz_type == CHART_TYPE,
                Slice.params.like("%x_axis_sort%"),
                Slice.params.like("%x_axis_sort_asc%"),
                Slice.params.like(f"%{ORIENTATION}%"),
            )
        )
        .all()
    )
    changes = 0
    for slc in slices:
        try:
            params = json.loads(slc.params)
            orientation = params.get("orientation")
            x_axis_sort = params.get("x_axis_sort")
            x_axis_sort_asc = params.pop("x_axis_sort_asc", None)
            if orientation == ORIENTATION and x_axis_sort:
                changes += 1
                params["x_axis_sort_asc"] = not x_axis_sort_asc
                slc.params = json.dumps(params, sort_keys=True)
        except Exception as e:
            print(e)
            print(f"Parsing params for slice {slc.id} failed.")
            pass

    session.commit()
    session.close()
    if changes:
        print(f"Updated {changes} bar chart sort orders.")
