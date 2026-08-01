# isort:skip_file

import logging
from collections.abc import Iterator
from typing import Callable

import yaml

from zobi.commands.chart.exceptions import ChartNotFoundError
from zobi.daos.chart import ChartDAO
from zobi.commands.dataset.export import ExportDatasetsCommand
from zobi.commands.export.models import ExportModelsCommand
from zobi.commands.tag.export import ExportTagsCommand
from zobi.models.slice import Slice
from zobi.tags.models import TagType
from zobi.utils.dict_import_export import EXPORT_VERSION
from zobi.utils.file import get_filename
from zobi.utils import json
from zobi.extensions import feature_flag_manager

logger = logging.getLogger(__name__)


# keys present in the standard export that are not needed
REMOVE_KEYS = ["datasource_type", "datasource_name", "url_params"]


class ExportChartsCommand(ExportModelsCommand):
    dao = ChartDAO
    not_found = ChartNotFoundError

    @staticmethod
    def _file_name(model: Slice) -> str:
        file_name = get_filename(model.slice_name, model.id)
        return f"charts/{file_name}.yaml"

    @staticmethod
    def _file_content(model: Slice) -> str:
        payload = model.export_to_dict(
            recursive=False,
            include_parent_ref=False,
            include_defaults=True,
            export_uuids=True,
        )
        # TODO (betodealmeida): move this logic to export_to_dict once this
        #  becomes the default export endpoint
        payload = {
            key: value for key, value in payload.items() if key not in REMOVE_KEYS
        }

        if payload.get("params"):
            try:
                payload["params"] = json.loads(payload["params"])
            except json.JSONDecodeError:
                logger.info("Unable to decode `params` field: %s", payload["params"])

        payload["version"] = EXPORT_VERSION
        if model.table:
            payload["dataset_uuid"] = str(model.table.uuid)

        # Fetch tags from the database if TAGGING_SYSTEM is enabled
        if feature_flag_manager.is_feature_enabled("TAGGING_SYSTEM"):
            tags = getattr(model, "tags", [])
            payload["tags"] = [tag.name for tag in tags if tag.type == TagType.custom]
        file_content = yaml.safe_dump(payload, sort_keys=False)
        return file_content

    _include_tags: bool = True  # Default to True

    @classmethod
    def disable_tag_export(cls) -> None:
        cls._include_tags = False

    @classmethod
    def enable_tag_export(cls) -> None:
        cls._include_tags = True

    @staticmethod
    def _export(
        model: Slice, export_related: bool = True
    ) -> Iterator[tuple[str, Callable[[], str]]]:
        yield (
            ExportChartsCommand._file_name(model),
            lambda: ExportChartsCommand._file_content(model),
        )

        if model.table and export_related:
            yield from ExportDatasetsCommand([model.table.id]).run()

        # Check if the calling class is ExportDashboardCommands
        if (
            export_related
            and ExportChartsCommand._include_tags
            and feature_flag_manager.is_feature_enabled("TAGGING_SYSTEM")
        ):
            chart_id = model.id
            yield from ExportTagsCommand().export(chart_ids=[chart_id])
