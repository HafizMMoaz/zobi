from flask_appbuilder import Model
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from zobi import security_manager
from zobi.models.helpers import AuditMixinNullable


class UserAttribute(Model, AuditMixinNullable):
    """
    Custom attributes attached to the user.

    Extending the user attribute is tricky due to its dependency on the
    authentication type and circular dependencies in Zobi. Instead, we use
    a custom model for adding attributes.

    """

    __tablename__ = "user_attribute"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("ab_user.id"))
    user = relationship(
        security_manager.user_model, backref="extra_attributes", foreign_keys=[user_id]
    )
    welcome_dashboard_id = Column(Integer, ForeignKey("dashboards.id"))
    welcome_dashboard = relationship("Dashboard")
    avatar_url = Column(String(100))
