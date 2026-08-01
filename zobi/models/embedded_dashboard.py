import uuid

from flask_appbuilder import Model
from sqlalchemy import Column, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy_utils import UUIDType

from zobi.models.helpers import AuditMixinNullable


class EmbeddedDashboard(Model, AuditMixinNullable):
    """
    A configuration of embedding for a dashboard.
    Currently, the only embeddable resource is the Dashboard.
    If we add new embeddable resource types, this model should probably be renamed.

    References the dashboard, and contains a config for embedding that dashboard.

    This data model allows multiple configurations for a given dashboard,
    but at this time the API only allows setting one.
    """

    __tablename__ = "embedded_dashboards"

    uuid = Column(UUIDType(binary=True), default=uuid.uuid4, primary_key=True)
    allow_domain_list = Column(Text)  # reference the `allowed_domains` property instead
    dashboard_id = Column(
        Integer,
        ForeignKey("dashboards.id", ondelete="CASCADE"),
        nullable=False,
    )
    dashboard = relationship(
        "Dashboard",
        back_populates="embedded",
        foreign_keys=[dashboard_id],
    )

    @property
    def allowed_domains(self) -> list[str]:
        """
        A list of domains which are allowed to embed the dashboard.
        An empty list means any domain can embed.
        """
        return self.allow_domain_list.split(",") if self.allow_domain_list else []
