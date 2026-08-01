import logging
from typing import Any

from zobi import db
from zobi.models.core import Database

EXPORT_VERSION = "1.0.0"
DATABASES_KEY = "databases"
logger = logging.getLogger(__name__)


def export_schema_to_dict(back_references: bool) -> dict[str, Any]:
    """Exports the supported import/export schema to a dictionary"""
    databases = [
        Database.export_schema(recursive=True, include_parent_ref=back_references)
    ]
    data = {}
    if databases:
        data[DATABASES_KEY] = databases
    return data


def export_to_dict(
    recursive: bool, back_references: bool, include_defaults: bool
) -> dict[str, Any]:
    """Exports databases to a dictionary"""
    logger.info("Starting export")
    dbs = db.session.query(Database)
    databases = [
        database.export_to_dict(
            recursive=recursive,
            include_parent_ref=back_references,
            include_defaults=include_defaults,
        )
        for database in dbs
    ]
    logger.info("Exported %d %s", len(databases), DATABASES_KEY)
    data = {}
    if databases:
        data[DATABASES_KEY] = databases
    return data
