
from __future__ import annotations

from typing import Any

from marshmallow import Schema
from sqlalchemy.orm import Session  # noqa: F401

from zobi.commands.database.exceptions import DatabaseImportError
from zobi.commands.database.importers.v1.utils import import_database
from zobi.commands.dataset.importers.v1.utils import import_dataset
from zobi.commands.importers.v1 import ImportModelsCommand
from zobi.daos.database import DatabaseDAO
from zobi.databases.schemas import ImportV1DatabaseSchema
from zobi.datasets.schemas import ImportV1DatasetSchema


class ImportDatabasesCommand(ImportModelsCommand):
    """Import databases"""

    dao = DatabaseDAO
    model_name = "database"
    prefix = "databases/"
    schemas: dict[str, Schema] = {
        "databases/": ImportV1DatabaseSchema(),
        "datasets/": ImportV1DatasetSchema(),
    }
    import_error = DatabaseImportError

    @staticmethod
    def _import(
        configs: dict[str, Any],
        overwrite: bool = False,
        contents: dict[str, Any] | None = None,
    ) -> None:
        # first import databases
        database_ids: dict[str, int] = {}
        for file_name, config in configs.items():
            if file_name.startswith("databases/"):
                database = import_database(config, overwrite=overwrite)
                database_ids[str(database.uuid)] = database.id

        # import related datasets
        for file_name, config in configs.items():
            if (
                file_name.startswith("datasets/")
                and config["database_uuid"] in database_ids
            ):
                config["database_id"] = database_ids[config["database_uuid"]]
                # overwrite=False prevents deleting any non-imported columns/metrics
                import_dataset(config, overwrite=False)
