from zobi.constants import TimeGrain
from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.postgres import PostgresBaseEngineSpec


class NetezzaEngineSpec(PostgresBaseEngineSpec):
    engine = "netezza"
    default_driver = "nzpy"
    engine_name = "IBM Netezza Performance Server"

    metadata = {
        "description": "IBM Netezza Performance Server is a data warehouse appliance.",
        "logo": "netezza.png",
        "homepage_url": "https://www.ibm.com/products/netezza",
        "categories": [
            DatabaseCategory.TRADITIONAL_RDBMS,
            DatabaseCategory.PROPRIETARY,
        ],
        "pypi_packages": ["nzalchemy"],
        "connection_string": "netezza+nzpy://{username}:{password}@{hostname}:{port}/{database}",
        "default_port": 5480,
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

    @classmethod
    def epoch_to_dttm(cls) -> str:
        return "(timestamp 'epoch' + {col} * interval '1 second')"
