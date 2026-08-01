"""big_number_kpi_single_metric

Revision ID: be1b217cd8cd
Revises: 17fcea065655
Create Date: 2024-03-01 10:47:42.373508

"""

# revision identifiers, used by Alembic.
revision = "be1b217cd8cd"
down_revision = "17fcea065655"


from alembic import op  # noqa: E402
from sqlalchemy import Column, Integer, String, Text  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.migrations.shared.utils import paginated_update  # noqa: E402
from zobi.utils import json  # noqa: E402

Base = declarative_base()


class Slice(Base):
    __tablename__ = "slices"

    id = Column(Integer, primary_key=True)
    params = Column(Text)
    viz_type = Column(String(250))


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for slc in paginated_update(
        session.query(Slice).filter(Slice.viz_type == "pop_kpi")
    ):
        try:
            params = json.loads(slc.params)

            if "metrics" in params:
                if params["metrics"]:
                    params["metric"] = params["metrics"][0]

                del params["metrics"]
                slc.params = json.dumps(params, sort_keys=True)
        except Exception:  # noqa: S110
            pass

    session.commit()
    session.close()


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for slc in paginated_update(
        session.query(Slice).filter(Slice.viz_type == "pop_kpi")
    ):
        try:
            params = json.loads(slc.params)

            if "metric" in params:
                if params["metric"]:
                    params["metrics"] = [params["metric"]]

                del params["metric"]
                slc.params = json.dumps(params, sort_keys=True)
        except Exception:  # noqa: S110
            pass

    session.commit()
    session.close()
