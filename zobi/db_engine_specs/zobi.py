
"""
A native Zobi database.
"""

from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.shillelagh import ShillelaghEngineSpec


class ZobiEngineSpec(ShillelaghEngineSpec):
    """
    Internal engine for Zobi

    This DB engine spec is a meta-database. It uses the shillelagh library
    to build a DB that can operate across different Zobi databases.
    """

    engine = "zobi"
    engine_name = "Zobi meta database"
    drivers = {"": "Native driver"}
    default_driver = ""
    sqlalchemy_uri_placeholder = "zobi://"

    supports_file_upload = False

    metadata = {
        "description": (
            "Zobi meta database is an experimental feature that enables "
            "querying across multiple configured databases using a single connection."
        ),
        "logo": "zobi.svg",
        "homepage_url": "https://zobi.dev/",
        "categories": [DatabaseCategory.OTHER],
        "pypi_packages": [],
        "connection_string": "zobi://",
        "notes": (
            "This is an internal Zobi feature. Enable with ENABLE_ZOBI_META_DB "
            "feature flag. Allows cross-database queries using virtual tables."
        ),
    }
