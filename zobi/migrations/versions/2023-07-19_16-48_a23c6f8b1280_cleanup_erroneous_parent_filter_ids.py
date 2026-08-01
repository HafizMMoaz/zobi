"""cleanup erroneous parent filter IDs

Revision ID: a23c6f8b1280
Revises: 863adcf72773
Create Date: 2023-07-19 16:48:05.571149

"""

# revision identifiers, used by Alembic.
revision = "a23c6f8b1280"
down_revision = "863adcf72773"


import logging  # noqa: E402

from alembic import op  # noqa: E402
from sqlalchemy import Column, Integer, Text  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.utils import json  # noqa: E402

Base = declarative_base()


class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(Integer, primary_key=True)
    json_metadata = Column(Text)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for dashboard in session.query(Dashboard).all():
        if dashboard.json_metadata:
            updated = False

            try:
                json_metadata = json.loads(dashboard.json_metadata)

                if filters := json_metadata.get("native_filter_configuration"):
                    filter_ids = {fltr["id"] for fltr in filters}

                    for fltr in filters:
                        for parent_id in fltr.get("cascadeParentIds", [])[:]:
                            if parent_id not in filter_ids:
                                fltr["cascadeParentIds"].remove(parent_id)
                                updated = True

                if updated:
                    dashboard.json_metadata = json.dumps(json_metadata)
            except Exception:
                logging.exception(
                    "Unable to parse JSON metadata for dashboard %s", dashboard.id
                )

    session.commit()
    session.close()


def downgrade():
    pass
