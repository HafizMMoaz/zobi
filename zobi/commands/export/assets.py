from collections.abc import Iterator
from datetime import datetime, timezone
from typing import Callable

import yaml

from zobi.commands.base import BaseCommand
from zobi.commands.chart.export import ExportChartsCommand
from zobi.commands.dashboard.export import ExportDashboardsCommand
from zobi.commands.database.export import ExportDatabasesCommand
from zobi.commands.dataset.export import ExportDatasetsCommand
from zobi.commands.query.export import ExportSavedQueriesCommand
from zobi.utils.dict_import_export import EXPORT_VERSION

METADATA_FILE_NAME = "metadata.yaml"


class ExportAssetsCommand(BaseCommand):
    """
    Command that exports all databases, datasets, charts, dashboards and saved queries.
    """

    def run(self) -> Iterator[tuple[str, Callable[[], str]]]:
        metadata = {
            "version": EXPORT_VERSION,
            "type": "assets",
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        }
        yield METADATA_FILE_NAME, lambda: yaml.safe_dump(metadata, sort_keys=False)
        seen = {METADATA_FILE_NAME}

        commands = [
            ExportDatabasesCommand,
            ExportDatasetsCommand,
            ExportChartsCommand,
            ExportDashboardsCommand,
            ExportSavedQueriesCommand,
        ]

        for command in commands:
            ids = [model.id for model in command.dao.find_all()]
            for file_name, file_content in command(ids, export_related=False).run():
                if file_name not in seen:
                    yield file_name, file_content
                    seen.add(file_name)

    def validate(self) -> None:
        pass
