import logging
from collections.abc import Iterator
from typing import Callable

import yaml

from zobi.commands.export.models import ExportModelsCommand
from zobi.commands.theme.exceptions import ThemeNotFoundError
from zobi.daos.theme import ThemeDAO
from zobi.models.core import Theme
from zobi.utils import json
from zobi.utils.dict_import_export import EXPORT_VERSION
from zobi.utils.file import get_filename

logger = logging.getLogger(__name__)


class ExportThemesCommand(ExportModelsCommand):
    dao = ThemeDAO
    not_found = ThemeNotFoundError

    @staticmethod
    def _file_name(model: Theme) -> str:
        file_name = get_filename(model.theme_name, model.id, skip_id=True)
        return f"themes/{file_name}.yaml"

    @staticmethod
    def _file_content(model: Theme) -> str:
        payload = model.export_to_dict(
            recursive=False,
            include_parent_ref=False,
            include_defaults=True,
            export_uuids=True,
        )

        # Parse and format JSON data for better readability
        if payload.get("json_data"):
            try:
                json_data = json.loads(payload["json_data"])
                payload["json_data"] = json_data
            except (TypeError, json.JSONDecodeError):
                logger.info(
                    "Unable to decode `json_data` field: %s", payload["json_data"]
                )
                # Keep as string if parsing fails

        payload["version"] = EXPORT_VERSION

        file_content = yaml.safe_dump(payload, sort_keys=False)
        return file_content

    @staticmethod
    def _export(
        model: Theme, export_related: bool = True
    ) -> Iterator[tuple[str, Callable[[], str]]]:
        yield (
            ExportThemesCommand._file_name(model),
            lambda: ExportThemesCommand._file_content(model),
        )
