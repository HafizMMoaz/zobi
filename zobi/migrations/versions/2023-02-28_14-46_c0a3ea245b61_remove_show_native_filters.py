"""remove_show_native_filters

Revision ID: c0a3ea245b61
Revises: 9c2a5681ddfd
Create Date: 2023-02-28 14:46:59.597847

"""

# revision identifiers, used by Alembic.
revision = "c0a3ea245b61"
down_revision = "9c2a5681ddfd"

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
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for dashboard in session.query(Dashboard).all():
        try:
            json_metadata = json.loads(dashboard.json_metadata)

            if "show_native_filters" in json_metadata:
                del json_metadata["show_native_filters"]
                dashboard.json_metadata = json.dumps(json_metadata)
        except Exception:  # pylint: disable=broad-except  # noqa: S110
            pass

    session.commit()
    session.close()


def downgrade():
    pass
