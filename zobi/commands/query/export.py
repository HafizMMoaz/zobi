# isort:skip_file

import logging
from collections.abc import Iterator
from typing import Callable

import yaml
from werkzeug.utils import secure_filename

from zobi.commands.export.models import ExportModelsCommand
from zobi.models.sql_lab import SavedQuery
from zobi.commands.query.exceptions import SavedQueryNotFoundError
from zobi.daos.query import SavedQueryDAO
from zobi.utils.dict_import_export import EXPORT_VERSION
from zobi.utils import json

logger = logging.getLogger(__name__)


class ExportSavedQueriesCommand(ExportModelsCommand):
    dao = SavedQueryDAO
    not_found = SavedQueryNotFoundError

    @staticmethod
    def _file_name(model: SavedQuery) -> str:
        # build filename based on database, optional schema, and label
        # we call secure_filename() multiple times and join the directories afterwards,
        # as secure_filename() replaces "/" with "_".
        database_slug = secure_filename(model.database.database_name)
        query_slug = secure_filename(model.label) or str(model.uuid)
        if model.schema is None:
            file_name = f"queries/{database_slug}/{query_slug}.yaml"
        else:
            schema_slug = secure_filename(model.schema)
            file_name = f"queries/{database_slug}/{schema_slug}/{query_slug}.yaml"
        return file_name

    @staticmethod
    def _file_content(model: SavedQuery) -> str:
        payload = model.export_to_dict(
            recursive=False,
            include_parent_ref=False,
            include_defaults=True,
            export_uuids=True,
        )
        payload["version"] = EXPORT_VERSION
        payload["database_uuid"] = str(model.database.uuid)

        file_content = yaml.safe_dump(payload, sort_keys=False)
        return file_content

    @staticmethod
    def _export(
        model: SavedQuery, export_related: bool = True
    ) -> Iterator[tuple[str, Callable[[], str]]]:
        yield (
            ExportSavedQueriesCommand._file_name(model),
            lambda: ExportSavedQueriesCommand._file_content(model),
        )

        if export_related:  # TODO: Maybe we can use database export command here?
            # include database as well
            database_slug = secure_filename(model.database.database_name)
            file_name = f"databases/{database_slug}.yaml"

            payload = model.database.export_to_dict(
                recursive=False,
                include_parent_ref=False,
                include_defaults=True,
                export_uuids=True,
            )
            # TODO (betodealmeida): move this logic to export_to_dict once this
            # becomes the default export endpoint
            if "extra" in payload:
                try:
                    payload["extra"] = json.loads(payload["extra"])
                except json.JSONDecodeError:
                    logger.info("Unable to decode `extra` field: %s", payload["extra"])

            payload["version"] = EXPORT_VERSION

            file_content = yaml.safe_dump(payload, sort_keys=False)
            yield file_name, lambda: file_content
