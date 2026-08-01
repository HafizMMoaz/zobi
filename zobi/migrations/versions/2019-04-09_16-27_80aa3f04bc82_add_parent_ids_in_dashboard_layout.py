"""Add Parent ids in dashboard layout metadata

Revision ID: 80aa3f04bc82
Revises: 45e7da7cfeba
Create Date: 2019-04-09 16:27:03.392872

"""

import logging

from alembic import op
from sqlalchemy import Column, Integer, Text
from sqlalchemy.ext.declarative import declarative_base

from zobi import db
from zobi.utils import json

# revision identifiers, used by Alembic.
revision = "80aa3f04bc82"
down_revision = "45e7da7cfeba"

Base = declarative_base()


class Dashboard(Base):
    """Declarative class to do query in upgrade"""

    __tablename__ = "dashboards"
    id = Column(Integer, primary_key=True)
    position_json = Column(Text)


def add_parent_ids(node, layout):
    if node:
        current_id = node.get("id")
        parents = list(node.get("parents") or [])
        child_ids = node.get("children")

        if child_ids and len(child_ids) > 0:
            parents.append(current_id)
            for child_id in child_ids:
                child_node = layout.get(child_id)
                child_node["parents"] = parents
                add_parent_ids(child_node, layout)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    dashboards = session.query(Dashboard).all()
    for i, dashboard in enumerate(dashboards):
        print(
            "adding parents for dashboard layout, id = {} ({}/{}) >>>>".format(
                dashboard.id, i + 1, len(dashboards)
            )
        )
        try:
            layout = json.loads(dashboard.position_json or "{}")
            if layout and layout["ROOT_ID"]:
                add_parent_ids(layout["ROOT_ID"], layout)

            dashboard.position_json = json.dumps(
                layout, indent=None, separators=(",", ":"), sort_keys=True
            )
        except Exception as ex:
            logging.exception(ex)

    session.commit()
    session.close()


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    dashboards = session.query(Dashboard).all()
    for i, dashboard in enumerate(dashboards):
        print(
            "remove parents from dashboard layout, id = {} ({}/{}) >>>>".format(
                dashboard.id, i + 1, len(dashboards)
            )
        )
        try:
            layout = json.loads(dashboard.position_json or "{}")
            for key, item in layout.items():
                if not isinstance(item, dict):
                    continue
                item.pop("parents", None)
                layout[key] = item

            dashboard.position_json = json.dumps(
                layout, indent=None, separators=(",", ":"), sort_keys=True
            )
        except Exception as ex:
            logging.exception(ex)

    session.commit()
    session.close()
