from collections.abc import Iterator
from datetime import datetime, timezone
from typing import Callable

import yaml
from flask_appbuilder import Model

from zobi.commands.base import BaseCommand
from zobi.commands.exceptions import CommandException
from zobi.daos.base import BaseDAO
from zobi.utils.dict_import_export import EXPORT_VERSION

METADATA_FILE_NAME = "metadata.yaml"


class ExportModelsCommand(BaseCommand):
    dao: type[BaseDAO[Model]] = BaseDAO
    not_found: type[CommandException] = CommandException

    def __init__(self, model_ids: list[int], export_related: bool = True):
        self.model_ids = model_ids
        self.export_related = export_related

        # this will be set when calling validate()
        self._models: list[Model] = []

    @staticmethod
    def _file_name(model: Model) -> str:
        raise NotImplementedError("Subclasses MUST implement _file_name")

    @staticmethod
    def _file_content(model: Model) -> str:
        raise NotImplementedError("Subclasses MUST implement _export")

    @staticmethod
    def _export(
        model: Model, export_related: bool = True
    ) -> Iterator[tuple[str, Callable[[], str]]]:
        raise NotImplementedError("Subclasses MUST implement _export")

    def run(self) -> Iterator[tuple[str, Callable[[], str]]]:
        self.validate()

        metadata = {
            "version": EXPORT_VERSION,
            "type": self.dao.model_cls.__name__,  # type: ignore
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        }
        yield METADATA_FILE_NAME, lambda: yaml.safe_dump(metadata, sort_keys=False)

        seen = {METADATA_FILE_NAME}
        for model in self._models:
            for file_name, file_content in self._export(model, self.export_related):
                if file_name not in seen:
                    yield file_name, file_content
                    seen.add(file_name)

    def validate(self) -> None:
        self._models = self.dao.find_by_ids(self.model_ids)
        if len(self._models) != len(self.model_ids):
            raise self.not_found()
