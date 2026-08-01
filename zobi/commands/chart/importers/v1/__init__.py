from __future__ import annotations

from typing import Any

from marshmallow import Schema
from sqlalchemy.orm import Session  # noqa: F401

from zobi import db
from zobi.charts.schemas import ImportV1ChartSchema
from zobi.commands.chart.exceptions import ChartImportError
from zobi.commands.chart.importers.v1.utils import import_chart
from zobi.commands.database.importers.v1.utils import import_database
from zobi.commands.dataset.importers.v1.utils import import_dataset
from zobi.commands.importers.v1 import ImportModelsCommand
from zobi.commands.importers.v1.utils import import_tag
from zobi.commands.utils import update_chart_config_dataset
from zobi.connectors.sqla.models import SqlaTable
from zobi.daos.chart import ChartDAO
from zobi.databases.schemas import ImportV1DatabaseSchema
from zobi.datasets.schemas import ImportV1DatasetSchema
from zobi.extensions import feature_flag_manager


class ImportChartsCommand(ImportModelsCommand):
    """Import charts"""

    dao = ChartDAO
    model_name = "chart"
    prefix = "charts/"
    schemas: dict[str, Schema] = {
        "charts/": ImportV1ChartSchema(),
        "datasets/": ImportV1DatasetSchema(),
        "databases/": ImportV1DatabaseSchema(),
    }
    import_error = ChartImportError

    @staticmethod
    # ruff: noqa: C901
    def _import(
        configs: dict[str, Any],
        overwrite: bool = False,
        contents: dict[str, Any] | None = None,
    ) -> None:
        contents = {} if contents is None else contents
        # discover datasets associated with charts
        dataset_uuids: set[str] = set()
        for file_name, config in configs.items():
            if file_name.startswith("charts/"):
                dataset_uuids.add(config["dataset_uuid"])

        # discover databases associated with datasets
        database_uuids: set[str] = set()
        for file_name, config in configs.items():
            if file_name.startswith("datasets/") and config["uuid"] in dataset_uuids:
                database_uuids.add(config["database_uuid"])

        # import related databases
        database_ids: dict[str, int] = {}
        for file_name, config in configs.items():
            if file_name.startswith("databases/") and config["uuid"] in database_uuids:
                database = import_database(config, overwrite=False)
                database_ids[str(database.uuid)] = database.id

        # import datasets with the correct parent ref
        datasets: dict[str, SqlaTable] = {}
        for file_name, config in configs.items():
            if (
                file_name.startswith("datasets/")
                and config["database_uuid"] in database_ids
            ):
                config["database_id"] = database_ids[config["database_uuid"]]
                dataset = import_dataset(config, overwrite=False)
                datasets[str(dataset.uuid)] = dataset

        # import charts with the correct parent ref
        for file_name, config in configs.items():
            if file_name.startswith("charts/") and config["dataset_uuid"] in datasets:
                # Ignore obsolete filter-box charts.
                if config["viz_type"] == "filter_box":
                    continue

                # update datasource id, type, and name
                dataset = datasets[config["dataset_uuid"]]
                dataset_dict = {
                    "datasource_id": dataset.id,
                    "datasource_type": "table",
                    "datasource_name": dataset.table_name,
                }
                config = update_chart_config_dataset(config, dataset_dict)
                chart = import_chart(config, overwrite=overwrite)

                # Handle tags using import_tag function
                if feature_flag_manager.is_feature_enabled("TAGGING_SYSTEM"):
                    if "tags" in config:
                        target_tag_names = config["tags"]
                        import_tag(
                            target_tag_names, contents, chart.id, "chart", db.session
                        )
