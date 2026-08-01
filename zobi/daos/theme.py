import logging
from typing import Optional

from zobi.daos.base import BaseDAO
from zobi.extensions import db
from zobi.models.core import Theme

logger = logging.getLogger(__name__)


class ThemeDAO(BaseDAO[Theme]):
    @classmethod
    def find_by_uuid(cls, uuid: str) -> Optional[Theme]:
        """Find theme by UUID."""
        return db.session.query(Theme).filter(Theme.uuid == uuid).first()

    @classmethod
    def find_system_default(cls) -> Optional[Theme]:
        """
        Find the current system default theme.
        Returns the theme with is_system_default=True if exactly one exists.
        Returns None if no theme or multiple themes have
        is_system_default=True, which triggers fallback to config.py theme.
        """
        system_defaults = (
            db.session.query(Theme).filter(Theme.is_system_default.is_(True)).all()
        )

        if len(system_defaults) == 1:
            return system_defaults[0]

        return None

    @classmethod
    def find_system_dark(cls) -> Optional[Theme]:
        """Find the current system dark theme.

        Returns the theme with is_system_dark=True if exactly one exists.
        Returns None if no theme or multiple themes have is_system_dark=True,
        which triggers fallback to config.py theme.
        """
        system_darks = (
            db.session.query(Theme).filter(Theme.is_system_dark.is_(True)).all()
        )

        if len(system_darks) == 1:
            return system_darks[0]

        return None
