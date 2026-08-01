"""fix query and saved_query null schema

Revision ID: b5a422d8e252
Revises: b8d3a24d9131
Create Date: 2022-03-02 09:20:02.919490

"""

from alembic import op
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

from zobi import db

# revision identifiers, used by Alembic.
revision = "b5a422d8e252"
down_revision = "b8d3a24d9131"

Base = declarative_base()


class Query(Base):
    __tablename__ = "query"

    id = Column(Integer, primary_key=True)
    schema = Column(String(256))


class SavedQuery(Base):
    __tablename__ = "saved_query"

    id = Column(Integer, primary_key=True)
    schema = Column(String(128))


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for model in (Query, SavedQuery):
        for record in session.query(model).filter(model.schema == "null"):
            record.schema = None

        session.commit()

    session.close()


def downgrade():
    pass
