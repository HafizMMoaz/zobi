from __future__ import annotations

from typing import TYPE_CHECKING

from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.sqlite import SqliteEngineSpec

if TYPE_CHECKING:
    from zobi.models.core import Database


class ShillelaghEngineSpec(SqliteEngineSpec):
    """Engine for shillelagh"""

    engine_name = "Shillelagh"
    engine = "shillelagh"
    drivers = {"apsw": "SQLite driver"}
    default_driver = "apsw"
    sqlalchemy_uri_placeholder = "shillelagh://"

    allows_joins = True
    allows_subqueries = True

    metadata = {
        "description": (
            "Shillelagh is a Python library that allows querying many data sources "
            "using SQL, including Google Sheets, CSV files, and APIs."
        ),
        "logo": "shillelagh.png",
        "homepage_url": "https://shillelagh.readthedocs.io/",
        "categories": [DatabaseCategory.OTHER, DatabaseCategory.OPEN_SOURCE],
        "pypi_packages": ["shillelagh[gsheetsapi]"],
        "connection_string": "shillelagh://",
        "notes": (
            "Shillelagh uses virtual tables to query external data sources. "
            "Google Sheets requires OAuth credentials configured."
        ),
    }

    @classmethod
    def get_function_names(
        cls,
        database: Database,
    ) -> list[str]:
        return super().get_function_names(database) + [
            "sleep",
            "version",
            "get_metadata",
        ]
