# isort:skip_file

import logging
from collections.abc import Iterator
from typing import Callable

import yaml

from zobi.commands.export.models import ExportModelsCommand
from zobi.connectors.sqla.models import SqlaTable
from zobi.commands.dataset.exceptions import DatasetNotFoundError
from zobi.daos.dataset import DatasetDAO
from zobi.utils.dict_import_export import EXPORT_VERSION
from zobi.utils.file import get_filename
from zobi.utils.ssh_tunnel import mask_password_info
from zobi.utils import json

logger = logging.getLogger(__name__)

JSON_KEYS = {"params", "template_params", "extra"}


class ExportDatasetsCommand(ExportModelsCommand):
    dao = DatasetDAO
    not_found = DatasetNotFoundError

    @staticmethod
    def _file_name(model: SqlaTable) -> str:
        db_file_name = get_filename(
            model.database.database_name, model.database.id, skip_id=True
        )
        ds_file_name = get_filename(model.table_name, model.id)
        return f"datasets/{db_file_name}/{ds_file_name}.yaml"

    @staticmethod
    def _file_content(model: SqlaTable) -> str:
        payload = model.export_to_dict(
            recursive=True,
            include_parent_ref=False,
            include_defaults=True,
            export_uuids=True,
        )
        # TODO (betodealmeida): move this logic to export_to_dict once this
        # becomes the default export endpoint
        for key in JSON_KEYS:
            if payload.get(key):
                try:
                    payload[key] = json.loads(payload[key])
                except json.JSONDecodeError:
                    logger.info("Unable to decode `%s` field: %s", key, payload[key])
        for key in ("metrics", "columns"):
            for attributes in payload.get(key, []):
                if attributes.get("extra"):
                    try:
                        attributes["extra"] = json.loads(attributes["extra"])
                    except json.JSONDecodeError:
                        logger.info(
                            "Unable to decode `extra` field: %s", attributes["extra"]
                        )

        payload["version"] = EXPORT_VERSION
        payload["database_uuid"] = str(model.database.uuid)

        # Always set cache_timeout from the property to ensure correct value
        payload["cache_timeout"] = model.cache_timeout

        # SQLAlchemy returns column names as quoted_name objects which PyYAML cannot
        # serialize. Convert all keys to regular strings to fix YAML serialization.
        payload = {str(key): value for key, value in payload.items()}

        file_content = yaml.safe_dump(payload, sort_keys=False)
        return file_content

    @staticmethod
    def _export(
        model: SqlaTable, export_related: bool = True
    ) -> Iterator[tuple[str, Callable[[], str]]]:
        yield (
            ExportDatasetsCommand._file_name(model),
            lambda: ExportDatasetsCommand._file_content(model),
        )

        # include database as well
        if export_related:
            db_file_name = get_filename(
                model.database.database_name, model.database.id, skip_id=True
            )
            file_path = f"databases/{db_file_name}.yaml"

            payload = model.database.export_to_dict(
                recursive=False,
                include_parent_ref=False,
                include_defaults=True,
                export_uuids=True,
            )
            # TODO (betodealmeida): move this logic to export_to_dict once this
            # becomes the default export endpoint
            if payload.get("extra"):
                try:
                    payload["extra"] = json.loads(payload["extra"])
                except json.JSONDecodeError:
                    logger.info("Unable to decode `extra` field: %s", payload["extra"])

            if ssh_tunnel := model.database.ssh_tunnel:
                ssh_tunnel_payload = ssh_tunnel.export_to_dict(
                    recursive=False,
                    include_parent_ref=False,
                    include_defaults=True,
                    export_uuids=False,
                )
                payload["ssh_tunnel"] = mask_password_info(ssh_tunnel_payload)

            payload["version"] = EXPORT_VERSION

            yield file_path, lambda: yaml.safe_dump(payload, sort_keys=False)
