"""fix_table_chart_conditional_formatting_colors

Revision ID: 6d3c6f9d665d
Revises: ffa79af61a56
Create Date: 2022-08-16 15:23:42.860038

"""

from alembic import op
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base

from zobi import db
from zobi.utils import json

# revision identifiers, used by Alembic.
revision = "6d3c6f9d665d"
down_revision = "ffa79af61a56"

Base = declarative_base()


class Slice(Base):
    __tablename__ = "slices"
    id = Column(Integer, primary_key=True)
    viz_type = Column(String(250))
    params = Column(Text)


def upgrade():
    bind = op.get_bind()
    session = db.Session(bind=bind)

    for slc in session.query(Slice).filter(Slice.viz_type == "table"):
        params = json.loads(slc.params)
        conditional_formatting = params.get("conditional_formatting", [])
        if conditional_formatting:
            new_conditional_formatting = []
            for formatter in conditional_formatting:
                color_scheme = formatter.get("colorScheme")
                new_color_scheme = None
                if color_scheme == "rgb(0,255,0)":
                    # zobiTheme.colors.success.light1
                    new_color_scheme = "#ACE1C4"
                elif color_scheme == "rgb(255,255,0)":
                    # zobiTheme.colors.alert.light1
                    new_color_scheme = "#FDE380"
                elif color_scheme == "rgb(255,0,0)":
                    # zobiTheme.colors.error.light1
                    new_color_scheme = "#EFA1AA"
                if new_color_scheme:
                    new_conditional_formatting.append(
                        {**formatter, "colorScheme": new_color_scheme}
                    )
                else:
                    new_conditional_formatting.append(formatter)
            params["conditional_formatting"] = new_conditional_formatting
            slc.params = json.dumps(params)
            session.commit()
    session.close()


# it fixes a bug, downgrading isn't really needed here
def downgrade():
    pass
