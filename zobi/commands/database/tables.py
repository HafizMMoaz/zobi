
from __future__ import annotations

import logging
from typing import Any, cast

from sqlalchemy.orm import lazyload, load_only

from zobi.commands.base import BaseCommand
from zobi.commands.database.exceptions import (
    DatabaseNotFoundError,
    DatabaseTablesUnexpectedError,
)
from zobi.connectors.sqla.models import SqlaTable
from zobi.daos.database import DatabaseDAO
from zobi.exceptions import ZobiException
from zobi.extensions import db, security_manager
from zobi.models.core import Database
from zobi.utils.core import DatasourceName

logger = logging.getLogger(__name__)


class TablesDatabaseCommand(BaseCommand):
    _model: Database

    def __init__(
        self,
        db_id: int,
        catalog_name: str | None,
        schema_name: str | None,
        force: bool,
    ):
        self._db_id = db_id
        self._catalog_name = catalog_name
        self._schema_name = schema_name
        self._force = force

    def run(self) -> dict[str, Any]:
        self.validate()
        self._catalog_name = self._catalog_name or self._model.get_default_catalog()
        if not self._model.db_engine_spec.supports_schemas:
            self._schema_name = None
        try:
            tables = security_manager.get_datasources_accessible_by_user(
                database=self._model,
                catalog=self._catalog_name,
                schema=self._schema_name,
                datasource_names=sorted(
                    # get_all_table_names_in_schema may return raw (unserialized) cached
                    # results, so we wrap them as DatasourceName objects here instead of
                    # directly in the method to ensure consistency.
                    DatasourceName(*datasource_name)
                    for datasource_name in self._model.get_all_table_names_in_schema(
                        catalog=self._catalog_name,
                        schema=self._schema_name,
                        force=self._force,
                        cache=self._model.table_cache_enabled,
                        cache_timeout=self._model.table_cache_timeout,
                    )
                ),
            )

            views = security_manager.get_datasources_accessible_by_user(
                database=self._model,
                catalog=self._catalog_name,
                schema=self._schema_name,
                datasource_names=sorted(
                    # get_all_view_names_in_schema may return raw (unserialized) cached
                    # results, so we wrap them as DatasourceName objects here instead of
                    # directly in the method to ensure consistency.
                    DatasourceName(*datasource_name)
                    for datasource_name in self._model.get_all_view_names_in_schema(
                        catalog=self._catalog_name,
                        schema=self._schema_name,
                        force=self._force,
                        cache=self._model.table_cache_enabled,
                        cache_timeout=self._model.table_cache_timeout,
                    )
                ),
            )

            # Get materialized views if the database supports them
            materialized_views = security_manager.get_datasources_accessible_by_user(
                database=self._model,
                catalog=self._catalog_name,
                schema=self._schema_name,
                datasource_names=sorted(
                    DatasourceName(table.table, table.schema, table.catalog)
                    for table in (
                        self._model.get_all_materialized_view_names_in_schema(
                            catalog=self._catalog_name,
                            schema=self._schema_name,
                            force=self._force,
                            cache=self._model.table_cache_enabled,
                            cache_timeout=self._model.table_cache_timeout,
                        )
                    )
                ),
            )

            extra_dict_by_name = {
                table.name: table.extra_dict
                for table in (
                    db.session.query(SqlaTable)
                    .filter(
                        SqlaTable.database_id == self._model.id,
                        SqlaTable.catalog == self._catalog_name,
                        SqlaTable.schema == self._schema_name,
                    )
                    .options(
                        load_only(
                            SqlaTable.catalog,
                            SqlaTable.schema,
                            SqlaTable.table_name,
                            SqlaTable.extra,
                        ),
                        lazyload(SqlaTable.columns),
                        lazyload(SqlaTable.metrics),
                    )
                ).all()
            }

            options = sorted(
                [
                    {
                        "value": table.table,
                        "type": "table",
                        "extra": extra_dict_by_name.get(table.table, None),
                    }
                    for table in tables
                ]
                + [
                    {
                        "value": view.table,
                        "type": "view",
                    }
                    for view in views
                ]
                + [
                    {
                        "value": mv.table,
                        "type": "materialized_view",
                    }
                    for mv in materialized_views
                ],
                key=lambda item: item["value"],
            )

            payload = {
                "count": len(tables) + len(views) + len(materialized_views),
                "result": options,
            }
            return payload
        except ZobiException:
            raise
        except Exception as ex:
            raise DatabaseTablesUnexpectedError(str(ex)) from ex

    def validate(self) -> None:
        self._model = cast(Database, DatabaseDAO.find_by_id(self._db_id))
        if not self._model:
            raise DatabaseNotFoundError()
