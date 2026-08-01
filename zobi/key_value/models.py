from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import relationship
from zobi_core.common.models import KeyValue as CoreKeyValue

from zobi import security_manager
from zobi.models.helpers import AuditMixinNullable, ImportExportMixin

VALUE_MAX_SIZE = 2**24 - 1


class KeyValueEntry(CoreKeyValue, AuditMixinNullable, ImportExportMixin):
    """Key value store entity"""

    __tablename__ = "key_value"
    id = Column(Integer, primary_key=True)
    resource = Column(String(32), nullable=False)
    value = Column(LargeBinary(length=VALUE_MAX_SIZE), nullable=False)
    created_on = Column(DateTime, nullable=True)
    created_by_fk = Column(Integer, ForeignKey("ab_user.id"), nullable=True)
    changed_on = Column(DateTime, nullable=True)
    expires_on = Column(DateTime, nullable=True)
    changed_by_fk = Column(Integer, ForeignKey("ab_user.id"), nullable=True)
    created_by = relationship(security_manager.user_model, foreign_keys=[created_by_fk])
    changed_by = relationship(security_manager.user_model, foreign_keys=[changed_by_fk])

    def is_expired(self) -> bool:
        return self.expires_on is not None and self.expires_on <= datetime.now()
