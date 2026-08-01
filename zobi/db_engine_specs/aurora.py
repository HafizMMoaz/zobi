from zobi.db_engine_specs.mysql import MySQLEngineSpec
from zobi.db_engine_specs.postgres import PostgresEngineSpec


class AuroraMySQLDataAPI(MySQLEngineSpec):
    """Amazon Aurora MySQL via the Data API.

    Note: Documentation is in MySQLEngineSpec's compatible_databases section.
    This spec exists for runtime support of the auroradataapi driver.
    """

    engine = "mysql"
    default_driver = "auroradataapi"
    engine_name = "Aurora MySQL (Data API)"
    sqlalchemy_uri_placeholder = (
        "mysql+auroradataapi://{aws_access_id}:{aws_secret_access_key}@/"
        "{database_name}?"
        "aurora_cluster_arn={aurora_cluster_arn}&"
        "secret_arn={secret_arn}&"
        "region_name={region_name}"
    )


class AuroraPostgresDataAPI(PostgresEngineSpec):
    """Amazon Aurora PostgreSQL via the Data API.

    Note: Documentation is in PostgresEngineSpec's compatible_databases section.
    This spec exists for runtime support of the auroradataapi driver.
    """

    engine = "postgresql"
    default_driver = "auroradataapi"
    engine_name = "Aurora PostgreSQL (Data API)"
    sqlalchemy_uri_placeholder = (
        "postgresql+auroradataapi://{aws_access_id}:{aws_secret_access_key}@/"
        "{database_name}?"
        "aurora_cluster_arn={aurora_cluster_arn}&"
        "secret_arn={secret_arn}&"
        "region_name={region_name}"
    )


class AuroraMySQLEngineSpec(MySQLEngineSpec):
    """
    Aurora MySQL engine spec.

    IAM authentication is handled by the parent MySQLEngineSpec via
    the aws_iam config in encrypted_extra.
    """

    engine = "mysql"
    engine_name = "Aurora MySQL"
    default_driver = "mysqldb"


class AuroraPostgresEngineSpec(PostgresEngineSpec):
    """
    Aurora PostgreSQL engine spec.

    IAM authentication is handled by the parent PostgresEngineSpec via
    the aws_iam config in encrypted_extra.
    """

    engine = "postgresql"
    engine_name = "Aurora PostgreSQL"
    default_driver = "psycopg2"
