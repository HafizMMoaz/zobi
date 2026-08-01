import logging
from typing import Any

from flask import current_app as app

from zobi.commands.base import BaseCommand
from zobi.daos.theme import ThemeDAO
from zobi.extensions import db
from zobi.models.core import Theme
from zobi.utils import json
from zobi.utils.decorators import transaction

logger = logging.getLogger(__name__)


class SeedSystemThemesCommand(BaseCommand):
    """Command to seed system themes from configuration."""

    def run(self) -> None:
        """Seed system themes defined in application configuration."""

        themes_to_seed = []
        if theme_default := app.config.get("THEME_DEFAULT"):
            themes_to_seed.append(("THEME_DEFAULT", theme_default))
        if theme_dark := app.config.get("THEME_DARK"):
            themes_to_seed.append(("THEME_DARK", theme_dark))

        for theme_name, theme_config in themes_to_seed:
            self._upsert_system_theme(theme_name, theme_config)

    @transaction()
    def _upsert_system_theme(
        self, theme_name: str, theme_config: dict[str, Any]
    ) -> None:
        """Upsert a system theme."""
        # Handle UUID-only references by copying the referenced theme's definition
        if "uuid" in theme_config and len(theme_config) == 1:
            # UUID-only reference: fetch and copy the theme definition
            original_uuid = theme_config["uuid"]
            referenced_theme = ThemeDAO.find_by_uuid(original_uuid)
            if referenced_theme and referenced_theme.json_data:
                try:
                    theme_config = json.loads(referenced_theme.json_data)
                    # Add a note about the theme being copied from UUID reference
                    theme_config["NOTE"] = (
                        "Copied at startup from theme UUID %s based on config reference"
                    ) % original_uuid
                    logger.debug(
                        "Copied theme definition from UUID %s for system theme %s",
                        original_uuid,
                        theme_name,
                    )
                except (ValueError, TypeError) as ex:
                    logger.error(
                        "Failed to parse theme JSON for UUID %s: %s",
                        original_uuid,
                        ex,
                    )
                    return
            else:
                logger.error(
                    "Referenced theme with UUID %s not found for system theme %s",
                    original_uuid,
                    theme_name,
                )
                return
        # else: Either no UUID or UUID + definition provided, use theme_config as-is

        existing_theme = (
            db.session.query(Theme)
            .filter(Theme.theme_name == theme_name, Theme.is_system)
            .first()
        )

        json_data = json.dumps(theme_config)

        if existing_theme:
            existing_theme.json_data = json_data
            logger.debug("Updated system theme: %s", theme_name)
        else:
            new_theme = Theme(
                theme_name=theme_name,
                json_data=json_data,
                is_system=True,
            )
            db.session.add(new_theme)
            logger.debug("Created system theme: %s", theme_name)

    def validate(self) -> None:
        """Validate that the command can be executed."""
        pass
