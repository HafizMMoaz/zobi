import logging
from functools import partial
from typing import Optional

from sqlalchemy import update

from zobi.commands.base import BaseCommand
from zobi.commands.theme.exceptions import ThemeNotFoundError
from zobi.daos.theme import ThemeDAO
from zobi.extensions import db
from zobi.models.core import Theme
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class SetSystemDefaultThemeCommand(BaseCommand):
    def __init__(self, theme_id: int):
        self._theme_id = theme_id
        self._theme: Optional[Theme] = None

    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> Theme:
        self.validate()
        assert self._theme

        # Clear all existing system defaults in a single query
        db.session.execute(
            update(Theme)
            .where(Theme.is_system_default.is_(True))
            .values(is_system_default=False)
        )

        # Set the new system default
        self._theme.is_system_default = True
        db.session.add(self._theme)

        logger.info("Set theme %s as system default", self._theme_id)

        return self._theme

    def validate(self) -> None:
        self._theme = ThemeDAO.find_by_id(self._theme_id)
        if not self._theme:
            raise ThemeNotFoundError()


class SetSystemDarkThemeCommand(BaseCommand):
    def __init__(self, theme_id: int):
        self._theme_id = theme_id
        self._theme: Optional[Theme] = None

    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> Theme:
        self.validate()
        assert self._theme

        # Clear all existing system dark themes in a single query
        db.session.execute(
            update(Theme)
            .where(Theme.is_system_dark.is_(True))
            .values(is_system_dark=False)
        )

        # Set the new system dark theme
        self._theme.is_system_dark = True
        db.session.add(self._theme)

        logger.info("Set theme %s as system dark", self._theme_id)

        return self._theme

    def validate(self) -> None:
        self._theme = ThemeDAO.find_by_id(self._theme_id)
        if not self._theme:
            raise ThemeNotFoundError()


class ClearSystemDefaultThemeCommand(BaseCommand):
    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> None:
        # Clear all system default themes
        db.session.execute(
            update(Theme)
            .where(Theme.is_system_default.is_(True))
            .values(is_system_default=False)
        )

        logger.info("Cleared system default theme")

    def validate(self) -> None:
        # No validation needed for clearing
        pass


class ClearSystemDarkThemeCommand(BaseCommand):
    @transaction(on_error=partial(on_error, reraise=Exception))
    def run(self) -> None:
        # Clear all system dark themes
        db.session.execute(
            update(Theme)
            .where(Theme.is_system_dark.is_(True))
            .values(is_system_dark=False)
        )

        logger.info("Cleared system dark theme")

    def validate(self) -> None:
        # No validation needed for clearing
        pass
