"""migrate_filter_boxes_to_native_filters

Revision ID: 214f580d09c9
Revises: a32e0c4d8646
Create Date: 2024-01-10 09:20:32.233912

"""

# revision identifiers, used by Alembic.
revision = "214f580d09c9"
down_revision = "a32e0c4d8646"

from alembic import op  # noqa: E402
from sqlalchemy import Column, ForeignKey, Integer, String, Table, Text  # noqa: E402
from sqlalchemy.ext.declarative import declarative_base  # noqa: E402
from sqlalchemy.orm import relationship  # noqa: E402

from zobi import db  # noqa: E402
from zobi.migrations.shared.native_filters import migrate_dashboard  # noqa: E402
from zobi.migrations.shared.utils import paginated_update  # noqa: E402

Base = declarative_base()

dashboard_slices = Table(
    "dashboard_slices",
    Base.metadata,
    Column("id", Integer, primary_key=True),
    Column("dashboard_id", Integer, ForeignKey("dashboards.id")),
    Column("slice_id", Integer, ForeignKey("slices.id")),
)


class Dashboard(Base):  # type: ignore # pylint: disable=too-few-public-methods
    __tablename__ = "dashboards"

    id = Column(Integer, primary_key=True)
    json_metadata = Column(Text)
    slices = relationship("Slice", secondary=dashboard_slices, backref="dashboards")
    position_json = Column()

    def __repr__(self) -> str:
        return f"Dashboard<{self.id}>"


class Slice(Base):  # type: ignore # pylint: disable=too-few-public-methods
    __tablename__ = "slices"

    id = Column(Integer, primary_key=True)
    datasource_id = Column(Integer)
    params = Column(Text)
    slice_name = Column(String(250))
    viz_type = Column(String(250))

    def __repr__(self) -> str:
        return f"Slice<{self.id}>"


def upgrade():
    session = db.Session(bind=op.get_bind())

    for dashboard in paginated_update(session.query(Dashboard)):
        migrate_dashboard(dashboard)

    # Delete the obsolete filter-box charts.
    session.query(Slice).filter(Slice.viz_type == "filter_box").delete()
    session.commit()


def downgrade():
    pass
