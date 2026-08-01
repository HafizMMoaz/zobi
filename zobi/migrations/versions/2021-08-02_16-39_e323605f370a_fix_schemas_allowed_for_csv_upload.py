"""fix schemas_allowed_for_csv_upload

Revision ID: e323605f370a
Revises: 31b2a1039d4a
Create Date: 2021-08-02 16:39:45.329151

"""

import logging

from alembic import op
from sqlalchemy import Column, Integer, Text
from sqlalchemy.ext.declarative import declarative_base

from zobi import db
from zobi.utils import json

# revision identifiers, used by Alembic.
revision = "e323605f370a"
down_revision = "31b2a1039d4a"


Base = declarative_base()

logger = logging.getLogger("alembic.env")


class Database(Base):
    __tablename__ = "dbs"
    id = Column(Integer, primary_key=True)
    extra = Column(Text)


def upgrade():
    """
    Fix databases with ``schemas_allowed_for_csv_upload`` stored as string.
    """
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for database in session.query(Database).all():
        try:
            extra = json.loads(database.extra)
        except json.JSONDecodeError as ex:
            logger.warning(str(ex))
            continue

        schemas_allowed_for_csv_upload = extra.get("schemas_allowed_for_csv_upload")
        if not isinstance(schemas_allowed_for_csv_upload, str):
            continue

        if schemas_allowed_for_csv_upload == "[]":
            extra["schemas_allowed_for_csv_upload"] = []
        else:
            extra["schemas_allowed_for_csv_upload"] = [
                schema.strip()
                for schema in schemas_allowed_for_csv_upload.split(",")
                if schema.strip()
            ]

        database.extra = json.dumps(extra)

    session.commit()
    session.close()


def downgrade():
    pass
