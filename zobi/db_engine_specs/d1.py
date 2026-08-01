
from __future__ import annotations

from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.sqlite import SqliteEngineSpec


class CloudflareD1EngineSpec(SqliteEngineSpec):
    """Engine spec for Cloudflare D1 serverless SQLite database."""

    engine = "d1"
    engine_name = "Cloudflare D1"
    default_driver = "d1"

    metadata = {
        "description": "Cloudflare D1 is a serverless SQLite database.",
        "logo": "cloudflare.png",
        "homepage_url": "https://developers.cloudflare.com/d1/",
        "categories": [
            DatabaseCategory.CLOUD_DATA_WAREHOUSES,
            DatabaseCategory.TRADITIONAL_RDBMS,
            DatabaseCategory.HOSTED_OPEN_SOURCE,
        ],
        "pypi_packages": ["zobi-engine-d1"],
        "connection_string": (
            "d1://{cloudflare_account_id}:{cloudflare_api_token}"
            "@{cloudflare_d1_database_id}"
        ),
        "parameters": {
            "cloudflare_account_id": "Cloudflare account ID",
            "cloudflare_api_token": "Cloudflare API token",
            "cloudflare_d1_database_id": "D1 database ID",
        },
        "install_instructions": "pip install zobi-engine-d1",
    }
