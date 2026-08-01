"""rename_filter_configuration_in_dashboard_metadata.py

Revision ID: 989bbe479899
Revises: 67da9ef1ef9c
Create Date: 2021-03-24 09:47:21.569508

"""

# revision identifiers, used by Alembic.
revision = "989bbe479899"
down_revision = "67da9ef1ef9c"

from alembic import op  # noqa: E402
from sqlalchemy import Column, Integer, Text  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.utils import json  # noqa: E402

Base = declarative_base()


class Dashboard(Base):
    """Declarative class to do query in upgrade"""

    __tablename__ = "dashboards"
    id = Column(Integer, primary_key=True)
    json_metadata = Column(Text)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    dashboards = (
        session.query(Dashboard)
        .filter(Dashboard.json_metadata.like('%"filter_configuration"%'))
        .all()
    )
    changes = 0
    for dashboard in dashboards:
        try:
            json_metadata = json.loads(dashboard.json_metadata)
            filter_configuration = json_metadata.pop("filter_configuration", None)
            if filter_configuration:
                changes += 1
                json_metadata["native_filter_configuration"] = filter_configuration
                dashboard.json_metadata = json.dumps(json_metadata, sort_keys=True)
        except Exception as e:
            print(e)
            print(f"Parsing json_metadata for dashboard {dashboard.id} failed.")
            pass

    session.commit()
    session.close()
    print(f"Updated {changes} native filter configurations.")


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    dashboards = (
        session.query(Dashboard)
        .filter(Dashboard.json_metadata.like('%"native_filter_configuration"%'))
        .all()
    )
    changes = 0
    for dashboard in dashboards:
        try:
            json_metadata = json.loads(dashboard.json_metadata)
            native_filter_configuration = json_metadata.pop(
                "native_filter_configuration", None
            )
            if native_filter_configuration:
                changes += 1
                json_metadata["filter_configuration"] = native_filter_configuration
                dashboard.json_metadata = json.dumps(json_metadata, sort_keys=True)
        except Exception as e:
            print(e)
            print(f"Parsing json_metadata for dashboard {dashboard.id} failed.")
            pass

    session.commit()
    session.close()
    print(f"Updated {changes} pie chart labels.")
