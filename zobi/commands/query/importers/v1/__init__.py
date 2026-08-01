
from typing import Any, Optional

from marshmallow import Schema
from sqlalchemy.orm import Session  # noqa: F401

from zobi.commands.database.importers.v1.utils import import_database
from zobi.commands.importers.v1 import ImportModelsCommand
from zobi.commands.query.exceptions import SavedQueryImportError
from zobi.commands.query.importers.v1.utils import import_saved_query
from zobi.connectors.sqla.models import SqlaTable  # noqa: F401
from zobi.daos.query import SavedQueryDAO
from zobi.databases.schemas import ImportV1DatabaseSchema
from zobi.queries.saved_queries.schemas import ImportV1SavedQuerySchema


class ImportSavedQueriesCommand(ImportModelsCommand):
    """Import Saved Queries"""

    dao = SavedQueryDAO
    model_name = "saved_queries"
    prefix = "queries/"
    schemas: dict[str, Schema] = {
        "databases/": ImportV1DatabaseSchema(),
        "queries/": ImportV1SavedQuerySchema(),
    }
    import_error = SavedQueryImportError

    @staticmethod
    def _import(
        configs: dict[str, Any],
        overwrite: bool = False,
        contents: Optional[dict[str, Any]] = None,
    ) -> None:
        # discover databases associated with saved queries
        database_uuids: set[str] = set()
        for file_name, config in configs.items():
            if file_name.startswith("queries/"):
                database_uuids.add(config["database_uuid"])

        # import related databases
        database_ids: dict[str, int] = {}
        for file_name, config in configs.items():
            if file_name.startswith("databases/") and config["uuid"] in database_uuids:
                database = import_database(config, overwrite=False)
                database_ids[str(database.uuid)] = database.id

        # import saved queries with the correct parent ref
        for file_name, config in configs.items():
            if (
                file_name.startswith("queries/")
                and config["database_uuid"] in database_ids
            ):
                config["db_id"] = database_ids[config["database_uuid"]]
                import_saved_query(config, overwrite=overwrite)
