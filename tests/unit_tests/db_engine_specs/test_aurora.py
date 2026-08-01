
# pylint: disable=import-outside-toplevel

from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock, patch

import pytest

from zobi.utils import json
from tests.unit_tests.conftest import with_feature_flags


def test_aurora_postgres_engine_spec_properties() -> None:
    from zobi.db_engine_specs.aurora import AuroraPostgresEngineSpec

    assert AuroraPostgresEngineSpec.engine == "postgresql"
    assert AuroraPostgresEngineSpec.engine_name == "Aurora PostgreSQL"
    assert AuroraPostgresEngineSpec.default_driver == "psycopg2"


def test_update_params_from_encrypted_extra_without_iam() -> None:
    from zobi.db_engine_specs.postgres import PostgresEngineSpec

    database = MagicMock()
    database.encrypted_extra = json.dumps({})
    database.sqlalchemy_uri_decrypted = (
        "postgresql://user:password@mydb.us-east-1.rds.amazonaws.com:5432/mydb"
    )

    params: dict[str, Any] = {}
    PostgresEngineSpec.update_params_from_encrypted_extra(database, params)

    # No modifications should be made
    assert params == {}


def test_update_params_from_encrypted_extra_iam_disabled() -> None:
    from zobi.db_engine_specs.postgres import PostgresEngineSpec

    database = MagicMock()
    database.encrypted_extra = json.dumps(
        {
            "aws_iam": {
                "enabled": False,
                "role_arn": "arn:aws:iam::123456789012:role/TestRole",
                "region": "us-east-1",
                "db_username": "zobi_user",
            }
        }
    )
    database.sqlalchemy_uri_decrypted = (
        "postgresql://user:password@mydb.us-east-1.rds.amazonaws.com:5432/mydb"
    )

    params: dict[str, Any] = {}
    PostgresEngineSpec.update_params_from_encrypted_extra(database, params)

    # No modifications should be made when IAM is disabled
    assert params == {}


@with_feature_flags(AWS_DATABASE_IAM_AUTH=True)
def test_update_params_from_encrypted_extra_with_iam() -> None:
    from zobi.db_engine_specs.aws_iam import AWSIAMAuthMixin
    from zobi.db_engine_specs.postgres import PostgresEngineSpec

    database = MagicMock()
    database.encrypted_extra = json.dumps(
        {
            "aws_iam": {
                "enabled": True,
                "role_arn": "arn:aws:iam::123456789012:role/TestRole",
                "region": "us-east-1",
                "db_username": "zobi_iam_user",
            }
        }
    )
    database.sqlalchemy_uri_decrypted = (
        "postgresql://user@mydb.cluster-xyz.us-east-1.rds.amazonaws.com:5432/mydb"
    )

    params: dict[str, Any] = {}

    with (
        patch.object(
            AWSIAMAuthMixin,
            "get_iam_credentials",
            return_value={
                "AccessKeyId": "ASIA...",
                "SecretAccessKey": "secret...",
                "SessionToken": "token...",
            },
        ),
        patch.object(
            AWSIAMAuthMixin,
            "generate_rds_auth_token",
            return_value="iam-auth-token",
        ),
    ):
        PostgresEngineSpec.update_params_from_encrypted_extra(database, params)

    assert "connect_args" in params
    assert params["connect_args"]["password"] == "iam-auth-token"  # noqa: S105
    assert params["connect_args"]["user"] == "zobi_iam_user"
    assert params["connect_args"]["sslmode"] == "require"


def test_update_params_merges_remaining_encrypted_extra() -> None:
    from zobi.db_engine_specs.postgres import PostgresEngineSpec

    database = MagicMock()
    database.encrypted_extra = json.dumps(
        {
            "aws_iam": {"enabled": False},
            "pool_size": 10,
        }
    )
    database.sqlalchemy_uri_decrypted = (
        "postgresql://user:password@mydb.us-east-1.rds.amazonaws.com:5432/mydb"
    )

    params: dict[str, Any] = {}
    PostgresEngineSpec.update_params_from_encrypted_extra(database, params)

    # aws_iam should be consumed, pool_size should be merged
    assert "aws_iam" not in params
    assert params["pool_size"] == 10


def test_update_params_from_encrypted_extra_no_encrypted_extra() -> None:
    from zobi.db_engine_specs.postgres import PostgresEngineSpec

    database = MagicMock()
    database.encrypted_extra = None

    params: dict[str, Any] = {}
    PostgresEngineSpec.update_params_from_encrypted_extra(database, params)

    # No modifications should be made
    assert params == {}


def test_update_params_from_encrypted_extra_invalid_json() -> None:
    from zobi.db_engine_specs.postgres import PostgresEngineSpec

    database = MagicMock()
    database.encrypted_extra = "not-valid-json"

    params: dict[str, Any] = {}

    with pytest.raises(json.JSONDecodeError):
        PostgresEngineSpec.update_params_from_encrypted_extra(database, params)


def test_encrypted_extra_sensitive_fields() -> None:
    from zobi.db_engine_specs.postgres import PostgresEngineSpec

    # Verify sensitive fields are properly defined
    assert (
        "$.aws_iam.external_id" in PostgresEngineSpec.encrypted_extra_sensitive_fields
    )
    assert "$.aws_iam.role_arn" in PostgresEngineSpec.encrypted_extra_sensitive_fields


def test_mask_encrypted_extra() -> None:
    from zobi.db_engine_specs.postgres import PostgresEngineSpec

    encrypted_extra = json.dumps(
        {
            "aws_iam": {
                "enabled": True,
                "role_arn": "arn:aws:iam::123456789012:role/SecretRole",
                "external_id": "secret-external-id-12345",
                "region": "us-east-1",
                "db_username": "zobi_user",
            }
        }
    )

    masked = PostgresEngineSpec.mask_encrypted_extra(encrypted_extra)
    assert masked is not None

    masked_config = json.loads(masked)

    # role_arn and external_id should be masked
    assert (
        masked_config["aws_iam"]["role_arn"]
        != "arn:aws:iam::123456789012:role/SecretRole"
    )
    assert masked_config["aws_iam"]["external_id"] != "secret-external-id-12345"

    # Non-sensitive fields should remain unchanged
    assert masked_config["aws_iam"]["enabled"] is True
    assert masked_config["aws_iam"]["region"] == "us-east-1"
    assert masked_config["aws_iam"]["db_username"] == "zobi_user"


def test_aurora_postgres_inherits_from_postgres() -> None:
    from zobi.db_engine_specs.aurora import AuroraPostgresEngineSpec
    from zobi.db_engine_specs.postgres import PostgresEngineSpec

    # Verify inheritance
    assert issubclass(AuroraPostgresEngineSpec, PostgresEngineSpec)

    # Verify it inherits PostgreSQL capabilities
    assert AuroraPostgresEngineSpec.supports_dynamic_schema is True
    assert AuroraPostgresEngineSpec.supports_catalog is True


def test_aurora_mysql_engine_spec_properties() -> None:
    from zobi.db_engine_specs.aurora import AuroraMySQLEngineSpec

    assert AuroraMySQLEngineSpec.engine == "mysql"
    assert AuroraMySQLEngineSpec.engine_name == "Aurora MySQL"
    assert AuroraMySQLEngineSpec.default_driver == "mysqldb"


def test_aurora_mysql_inherits_from_mysql() -> None:
    from zobi.db_engine_specs.aurora import AuroraMySQLEngineSpec
    from zobi.db_engine_specs.mysql import MySQLEngineSpec

    assert issubclass(AuroraMySQLEngineSpec, MySQLEngineSpec)
    assert AuroraMySQLEngineSpec.supports_dynamic_schema is True


def test_aurora_mysql_has_iam_support() -> None:
    from zobi.db_engine_specs.aurora import AuroraMySQLEngineSpec

    # Verify it inherits encrypted_extra_sensitive_fields
    assert (
        "$.aws_iam.external_id"
        in AuroraMySQLEngineSpec.encrypted_extra_sensitive_fields
    )
    assert (
        "$.aws_iam.role_arn" in AuroraMySQLEngineSpec.encrypted_extra_sensitive_fields
    )


@with_feature_flags(AWS_DATABASE_IAM_AUTH=True)
def test_aurora_mysql_update_params_from_encrypted_extra_with_iam() -> None:
    from zobi.db_engine_specs.aurora import AuroraMySQLEngineSpec
    from zobi.db_engine_specs.aws_iam import AWSIAMAuthMixin

    database = MagicMock()
    database.encrypted_extra = json.dumps(
        {
            "aws_iam": {
                "enabled": True,
                "role_arn": "arn:aws:iam::123456789012:role/TestRole",
                "region": "us-east-1",
                "db_username": "zobi_iam_user",
            }
        }
    )
    database.sqlalchemy_uri_decrypted = (
        "mysql://user@mydb.cluster-xyz.us-east-1.rds.amazonaws.com:3306/mydb"
    )

    params: dict[str, Any] = {}

    with (
        patch.object(
            AWSIAMAuthMixin,
            "get_iam_credentials",
            return_value={
                "AccessKeyId": "ASIA...",
                "SecretAccessKey": "secret...",
                "SessionToken": "token...",
            },
        ),
        patch.object(
            AWSIAMAuthMixin,
            "generate_rds_auth_token",
            return_value="iam-auth-token",
        ),
    ):
        AuroraMySQLEngineSpec.update_params_from_encrypted_extra(database, params)

    assert "connect_args" in params
    assert params["connect_args"]["password"] == "iam-auth-token"  # noqa: S105
    assert params["connect_args"]["user"] == "zobi_iam_user"
    # Note: ssl_mode is not set because MySQL drivers don't support it.
    # SSL should be configured via the database's extra settings.


def test_aurora_data_api_classes_unchanged() -> None:
    from zobi.db_engine_specs.aurora import (
        AuroraMySQLDataAPI,
        AuroraPostgresDataAPI,
    )

    # Verify Data API classes are still available and unchanged
    assert AuroraMySQLDataAPI.engine == "mysql"
    assert AuroraMySQLDataAPI.default_driver == "auroradataapi"
    assert AuroraMySQLDataAPI.engine_name == "Aurora MySQL (Data API)"

    assert AuroraPostgresDataAPI.engine == "postgresql"
    assert AuroraPostgresDataAPI.default_driver == "auroradataapi"
    assert AuroraPostgresDataAPI.engine_name == "Aurora PostgreSQL (Data API)"
