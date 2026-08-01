from sqlalchemy.dialects import registry

from zobi.constants import TimeGrain
from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.impala import ImpalaEngineSpec


class AscendEngineSpec(ImpalaEngineSpec):
    """Engine spec for Ascend.io (Hive2+TLS) using Cloudera's Impala"""

    engine = "ascend"
    registry.register("ascend", "impala.sqlalchemy", "ImpalaDialect")

    engine_name = "Ascend"

    metadata = {
        "description": (
            "Ascend.io is a data automation platform for building data pipelines."
        ),
        "logo": "ascend.webp",
        "homepage_url": "https://www.ascend.io/",
        "categories": [
            DatabaseCategory.CLOUD_DATA_WAREHOUSES,
            DatabaseCategory.ANALYTICAL_DATABASES,
            DatabaseCategory.HOSTED_OPEN_SOURCE,
        ],
        "pypi_packages": ["impyla"],
        "connection_string": (
            "ascend://{username}:{password}@{hostname}:{port}/{database}"
            "?auth_mechanism=PLAIN;use_ssl=true"
        ),
    }

    _time_grain_expressions = {
        None: "{col}",
        TimeGrain.SECOND: "DATE_TRUNC('second', {col})",
        TimeGrain.MINUTE: "DATE_TRUNC('minute', {col})",
        TimeGrain.HOUR: "DATE_TRUNC('hour', {col})",
        TimeGrain.DAY: "DATE_TRUNC('day', {col})",
        TimeGrain.WEEK: "DATE_TRUNC('week', {col})",
        TimeGrain.MONTH: "DATE_TRUNC('month', {col})",
        TimeGrain.QUARTER: "DATE_TRUNC('quarter', {col})",
        TimeGrain.YEAR: "DATE_TRUNC('year', {col})",
    }
