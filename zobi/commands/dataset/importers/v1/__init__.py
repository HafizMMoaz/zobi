
from typing import Any, Optional

from marshmallow import Schema
from sqlalchemy.orm import Session  # noqa: F401

from zobi.commands.database.importers.v1.utils import import_database
from zobi.commands.dataset.exceptions import DatasetImportError
from zobi.commands.dataset.importers.v1.utils import import_dataset
from zobi.commands.importers.v1 import ImportModelsCommand
from zobi.daos.dataset import DatasetDAO
from zobi.databases.schemas import ImportV1DatabaseSchema
from zobi.datasets.schemas import ImportV1DatasetSchema


class ImportDatasetsCommand(ImportModelsCommand):
    """Import datasets"""

    dao = DatasetDAO
    model_name = "dataset"
    prefix = "datasets/"
    schemas: dict[str, Schema] = {
        "databases/": ImportV1DatabaseSchema(),
        "datasets/": ImportV1DatasetSchema(),
    }
    import_error = DatasetImportError

    @staticmethod
    def _import(
        configs: dict[str, Any],
        overwrite: bool = False,
        contents: Optional[dict[str, Any]] = None,
    ) -> None:
        if contents is None:
            contents = {}
        # discover databases associated with datasets
        database_uuids: set[str] = set()
        for file_name, config in configs.items():
            if file_name.startswith("datasets/"):
                database_uuids.add(config["database_uuid"])

        # import related databases
        database_ids: dict[str, int] = {}
        for file_name, config in configs.items():
            if file_name.startswith("databases/") and config["uuid"] in database_uuids:
                database = import_database(config, overwrite=False)
                database_ids[str(database.uuid)] = database.id

        # import datasets with the correct parent ref
        for file_name, config in configs.items():
            if (
                file_name.startswith("datasets/")
                and config["database_uuid"] in database_ids
            ):
                config["database_id"] = database_ids[config["database_uuid"]]
                import_dataset(config, overwrite=overwrite)
