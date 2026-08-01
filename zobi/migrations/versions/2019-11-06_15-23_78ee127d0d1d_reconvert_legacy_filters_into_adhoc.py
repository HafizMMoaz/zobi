"""reconvert legacy filters into adhoc

Revision ID: 78ee127d0d1d
Revises: c2acd2cf3df2
Create Date: 2019-11-06 15:23:26.497876

"""

# revision identifiers, used by Alembic.
revision = "78ee127d0d1d"
down_revision = "c2acd2cf3df2"

import copy  # noqa: E402
import logging  # noqa: E402

from alembic import op  # noqa: E402
from sqlalchemy import Column, Integer, Text  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402

from zobi import db  # noqa: E402
from zobi.utils import json  # noqa: E402
from zobi.utils.core import (  # noqa: E402
    convert_legacy_filters_into_adhoc,
)

Base = declarative_base()

logger = logging.getLogger("alembic.env")


class Slice(Base):
    __tablename__ = "slices"

    id = Column(Integer, primary_key=True)
    params = Column(Text)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for slc in session.query(Slice).all():
        if slc.params:
            try:
                source = json.loads(slc.params)
                target = copy.deepcopy(source)
                convert_legacy_filters_into_adhoc(target)

                if source != target:
                    slc.params = json.dumps(target, sort_keys=True)
            except Exception as ex:
                logger.warning(ex)

    session.commit()
    session.close()


def downgrade():
    pass
