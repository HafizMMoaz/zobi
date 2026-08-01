from datetime import datetime

from flask_appbuilder import Model
from sqlalchemy import Column, DateTime, Integer, String


class CacheKey(Model):  # pylint: disable=too-few-public-methods
    """Stores cache key records for the zobi visualization."""

    __tablename__ = "cache_keys"
    id = Column(Integer, primary_key=True)
    cache_key = Column(String(256), nullable=False)
    cache_timeout = Column(Integer, nullable=True)
    datasource_uid = Column(String(64), nullable=False, index=True)
    created_on = Column(DateTime, default=datetime.now, nullable=True)
