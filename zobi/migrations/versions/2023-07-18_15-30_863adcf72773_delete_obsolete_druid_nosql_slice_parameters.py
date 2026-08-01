"""delete obsolete Druid NoSQL slice parameters

Revision ID: 863adcf72773
Revises: 6d05b0a70c89
Create Date: 2023-07-18 15:30:43.695135

"""

# revision identifiers, used by Alembic.
revision = "863adcf72773"
down_revision = "6d05b0a70c89"

import logging  # noqa: E402

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
    query_context = Column(Text)


def upgrade():  # noqa: C901
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for slc in session.query(Slice).all():
        if slc.params:
            updated = False

            try:
                params = json.loads(slc.params)

                for key in ["druid_time_origin", "granularity"]:
                    if key in params:
                        del params[key]
                        updated = True

                if updated:
                    slc.params = json.dumps(params)
            except Exception:
                logging.exception("Unable to parse params for slice %s", slc.id)

        if slc.query_context:
            updated = False

            try:
                query_context = json.loads(slc.query_context)

                if form_data := query_context.get("form_data"):
                    for key in ["druid_time_origin", "granularity"]:
                        if key in form_data:
                            del form_data[key]
                            updated = True

                for query in query_context.get("queries", []):
                    for key in ["druid_time_origin", "granularity"]:
                        if key in query:
                            del query[key]
                            updated = True

                    if extras := query.get("extras"):
                        if "having_druid" in extras:
                            del extras["having_druid"]
                            updated = True

                if updated:
                    slc.query_context = json.dumps(query_context)
            except Exception:
                logging.exception("Unable to parse query context for slice %s", slc.id)

    session.commit()
    session.close()


def downgrade():
    pass
