from __future__ import annotations

import logging

from flask_appbuilder.security.sqla.models import User

from zobi.daos.base import BaseDAO
from zobi.extensions import db, security_manager
from zobi.models.user_attributes import UserAttribute

logger = logging.getLogger(__name__)


class UserDAO(BaseDAO[User]):
    @staticmethod
    def get_by_id(user_id: int) -> User:
        return db.session.query(security_manager.user_model).filter_by(id=user_id).one()

    @staticmethod
    def set_avatar_url(user: User, url: str) -> None:
        if user.extra_attributes:
            user.extra_attributes[0].avatar_url = url
        else:
            attrs = UserAttribute(avatar_url=url, user_id=user.id)
            user.extra_attributes = [attrs]
            db.session.add(attrs)
