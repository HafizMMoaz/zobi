from zobi.db_engine_specs.base import DatabaseCategory
from zobi.db_engine_specs.mssql import MssqlEngineSpec


class SybaseEngineSpec(MssqlEngineSpec):
    """Engine spec for SAP ASE (Sybase)

    SAP Adaptive Server Enterprise (ASE), formerly known as Sybase SQL Server,
    is a relational database management system. It uses Transact-SQL (T-SQL)
    similar to Microsoft SQL Server.
    """

    engine = "sybase"
    engine_name = "SAP Sybase"
    engine_aliases = {"sybase_sqlany"}  # Support SQL Anywhere dialect too
    default_driver = "pyodbc"

    metadata = {
        "description": (
            "SAP ASE (formerly Sybase) is an enterprise relational database."
        ),
        "logo": "sybase.png",
        "homepage_url": "https://www.sap.com/products/technology-platform/sybase-ase.html",
        "categories": [
            DatabaseCategory.TRADITIONAL_RDBMS,
            DatabaseCategory.PROPRIETARY,
        ],
        "pypi_packages": ["sqlalchemy-sybase", "pyodbc"],
        "connection_string": "sybase+pyodbc://{username}:{password}@{dsn}",
        "parameters": {
            "username": "Database username",
            "password": "Database password",
            "dsn": "ODBC Data Source Name configured for SAP ASE",
        },
        "notes": "Requires SAP ASE ODBC driver installed and configured as a DSN.",
        "docs_url": "https://help.sap.com/docs/SAP_ASE",
    }
