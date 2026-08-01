"""remove_filter_bar_orientation

Revision ID: 4ce1d9b25135
Revises: deb4c9d4a4ef
Create Date: 2022-11-28 17:51:08.954439

"""

# revision identifiers, used by Alembic.
revision = "4ce1d9b25135"
down_revision = "deb4c9d4a4ef"

import sqlalchemy as sa  # noqa: E402
from alembic import op  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.utils import json  # noqa: E402

Base = declarative_base()


class Dashboard(Base):
    __tablename__ = "dashboards"
    id = sa.Column(sa.Integer, primary_key=True)
    json_metadata = sa.Column(sa.Text)


def upgrade():
    pass


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    dashboards = (
        session.query(Dashboard)
        .filter(Dashboard.json_metadata.like('%"filter_bar_orientation"%'))
        .all()
    )
    for dashboard in dashboards:
        json_meta = json.loads(dashboard.json_metadata)
        filter_bar_orientation = json_meta.pop("filter_bar_orientation", None)
        if filter_bar_orientation:
            dashboard.json_metadata = json.dumps(json_meta)
    session.commit()
    session.close()
