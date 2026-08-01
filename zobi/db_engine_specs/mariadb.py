from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.mysql import MySQLEngineSpec


class MariaDBEngineSpec(MySQLEngineSpec):
    engine = "mariadb"
    engine_name = "MariaDB"

    metadata = {
        "description": "MariaDB is a community-developed fork of MySQL.",
        "logo": "mariadb.png",
        "homepage_url": "https://mariadb.org/",
        "categories": [
            DatabaseCategory.TRADITIONAL_RDBMS,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["mysqlclient"],
        "connection_string": "mysql://{username}:{password}@{host}/{database}",
        "default_port": 3306,
        "notes": "Uses the MySQL driver. Fully compatible with MySQL connector.",
    }
