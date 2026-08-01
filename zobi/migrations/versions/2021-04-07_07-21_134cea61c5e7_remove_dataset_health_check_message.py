"""remove dataset health check message

Revision ID: 134cea61c5e7
Revises: 301362411006
Create Date: 2021-04-07 07:21:27.324983

"""

# revision identifiers, used by Alembic.
revision = "134cea61c5e7"
down_revision = "301362411006"

import logging  # noqa: E402

from alembic import op  # noqa: E402
from sqlalchemy import Column, Integer, Text  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.utils import json  # noqa: E402

Base = declarative_base()


class SqlaTable(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True)
    extra = Column(Text)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for datasource in session.query(SqlaTable):
        if datasource.extra:
            try:
                extra = json.loads(datasource.extra)

                if extra and "health_check" in extra:
                    del extra["health_check"]
                    datasource.extra = json.dumps(extra) if extra else None
            except Exception as ex:
                logging.exception(ex)

    session.commit()
    session.close()


def downgrade():
    pass
