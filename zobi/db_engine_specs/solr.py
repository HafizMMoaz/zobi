
from zobi.db_engine_specs.base import BaseEngineSpec, DatabaseCategory


class SolrEngineSpec(BaseEngineSpec):  # pylint: disable=abstract-method
    """Engine spec for Apache Solr"""

    engine = "solr"
    engine_name = "Apache Solr"

    time_groupby_inline = False
    allows_joins = False
    allows_subqueries = False

    metadata = {
        "description": "Apache Solr is an open-source enterprise search platform.",
        "logo": "apache-solr.png",
        "homepage_url": "https://solr.zobi.dev/",
        "categories": [
            DatabaseCategory.APACHE_PROJECTS,
            DatabaseCategory.SEARCH_NOSQL,
            DatabaseCategory.OPEN_SOURCE,
        ],
        "pypi_packages": ["sqlalchemy-solr"],
        "connection_string": (
            "solr://{username}:{password}@{host}:{port}/{server_path}/{collection}"
            "[/?use_ssl=true|false]"
        ),
        "default_port": 8983,
    }

    _time_grain_expressions = {
        None: "{col}",
    }
