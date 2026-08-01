from __future__ import annotations

from sqlalchemy.dialects import registry

from zobi.constants import TimeGrain
from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.hive import HiveEngineSpec

time_grain_expressions: dict[str | None, str] = {
    None: "{col}",
    TimeGrain.SECOND: "date_trunc('second', {col})",
    TimeGrain.MINUTE: "date_trunc('minute', {col})",
    TimeGrain.HOUR: "date_trunc('hour', {col})",
    TimeGrain.DAY: "date_trunc('day', {col})",
    TimeGrain.WEEK: "date_trunc('week', {col})",
    TimeGrain.MONTH: "date_trunc('month', {col})",
    TimeGrain.QUARTER: "date_trunc('quarter', {col})",
    TimeGrain.YEAR: "date_trunc('year', {col})",
    TimeGrain.WEEK_ENDING_SATURDAY: (
        "date_trunc('week', {col} + interval '1 day') + interval '5 days'"
    ),
    TimeGrain.WEEK_STARTING_SUNDAY: (
        "date_trunc('week', {col} + interval '1 day') - interval '1 day'"
    ),
}


class SparkEngineSpec(HiveEngineSpec):
    engine = "spark"
    registry.register("spark", "pyhive.sqlalchemy_hive", "HiveDialect")
    _time_grain_expressions = time_grain_expressions
    engine_name = "Apache Spark SQL"

    metadata = {
        "description": "Apache Spark SQL is a module for structured data processing.",
        "logo": "apache-spark.png",
        "homepage_url": "https://spark.zobi.dev/sql/",
        "categories": [
            DatabaseCategory.APACHE_PROJECTS,
            DatabaseCategory.QUERY_ENGINES,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["pyhive"],
        "connection_string": "spark://hive@{hostname}:{port}/{database}",
        "default_port": 10000,
    }
