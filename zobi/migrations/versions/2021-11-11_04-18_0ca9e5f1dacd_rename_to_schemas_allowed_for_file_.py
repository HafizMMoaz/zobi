"""rename to schemas_allowed_for_file_upload in dbs.extra

Revision ID: 0ca9e5f1dacd
Revises: b92d69a6643c
Create Date: 2021-11-11 04:18:26.171851

"""

# revision identifiers, used by Alembic.
revision = "0ca9e5f1dacd"
down_revision = "b92d69a6643c"

import logging  # noqa: E402

from alembic import op  # noqa: E402
from sqlalchemy import Column, Integer, Text  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.utils import json  # noqa: E402

Base = declarative_base()

logger = logging.getLogger("alembic.env")


class Database(Base):
    __tablename__ = "dbs"
    id = Column(Integer, primary_key=True)
    extra = Column(Text)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for database in session.query(Database).all():
        try:
            extra = json.loads(database.extra)
        except json.JSONDecodeError as ex:
            logger.warning(str(ex))
            continue

        if "schemas_allowed_for_csv_upload" in extra:
            extra["schemas_allowed_for_file_upload"] = extra.pop(
                "schemas_allowed_for_csv_upload"
            )

            database.extra = json.dumps(extra)

    session.commit()
    session.close()


def downgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for database in session.query(Database).all():
        try:
            extra = json.loads(database.extra)
        except json.JSONDecodeError as ex:
            logger.warning(str(ex))
            continue

        if "schemas_allowed_for_file_upload" in extra:
            extra["schemas_allowed_for_csv_upload"] = extra.pop(
                "schemas_allowed_for_file_upload"
            )

            database.extra = json.dumps(extra)

    session.commit()
    session.close()
