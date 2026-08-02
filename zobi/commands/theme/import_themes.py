import logging
from typing import Any, TYPE_CHECKING

from marshmallow import Schema

if TYPE_CHECKING:
    from zobi.models.core import Theme

from zobi.commands.importers.v1 import ImportModelsCommand
from zobi.commands.theme.exceptions import ThemeImportError
from zobi.daos.theme import ThemeDAO
from zobi.themes.schemas import ImportV1ThemeSchema
from zobi.utils import json

logger = logging.getLogger(__name__)


def import_theme(config: dict[str, Any], overwrite: bool = False) -> "Theme | None":
    """Import a single theme from config dictionary"""
    from zobi import db, security_manager
    from zobi.models.core import Theme
    from zobi.utils.core import get_user

    can_write = security_manager.can_access("can_write", "Theme")
    existing = db.session.query(Theme).filter_by(uuid=config["uuid"]).first()

    if existing:
        if not overwrite or not can_write:
            return existing
        config["id"] = existing.id
    elif not can_write:
        raise ThemeImportError(
            "Theme doesn't exist and user doesn't have permission to create themes"
        )

    # Convert json_data from dict to string if needed
    if isinstance(config.get("json_data"), dict):
        config["json_data"] = json.dumps(config["json_data"])

    # Create or update theme
    theme = Theme.import_from_dict(config, recursive=False)
    if theme.id is None:
        db.session.flush()

    # Add current user as owner if creating new theme
    if not existing and (user := get_user()):
        theme.changed_by = user
        theme.created_by = user

    return theme


class ImportThemesCommand(ImportModelsCommand):
    """Import themes"""

    dao = ThemeDAO
    model_name = "theme"
    prefix = "themes/"
    schemas: dict[str, Schema] = {
        "themes/": ImportV1ThemeSchema(),
    }
    import_error = ThemeImportError

    @staticmethod
    def _import(
        configs: dict[str, Any],
        overwrite: bool = False,
        contents: dict[str, Any] | None = None,
    ) -> None:
        # Import each theme configuration
        for file_name, config in configs.items():
            if file_name.startswith("themes/"):
                import_theme(config, overwrite=overwrite)
