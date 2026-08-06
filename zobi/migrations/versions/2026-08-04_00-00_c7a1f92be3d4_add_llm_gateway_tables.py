"""Create llm_providers, llm_models and llm_router_config for the LLM gateway

Revision ID: c7a1f92be3d4
Revises: 33d7e0e21daa
Create Date: 2026-08-04 00:00:00.000000

"""

from alembic import op
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    LargeBinary,
    String,
    Text,
)
from sqlalchemy_utils import UUIDType

from zobi.migrations.shared.utils import (
    create_fks_for_table,
    create_index,
    create_table,
    drop_index,
    drop_table,
)

# revision identifiers, used by Alembic.
revision = "c7a1f92be3d4"
down_revision = "33d7e0e21daa"

PROVIDERS_TABLE = "llm_providers"
MODELS_TABLE = "llm_models"
ROUTER_CONFIG_TABLE = "llm_router_config"


def upgrade():
    """
    Create the three tables backing Manage > AI Models.

    - llm_providers: one row per vendor account, holding credentials. Secret
      params live in `encrypted_params`, which the ORM encrypts with the app
      SECRET_KEY; non-secret connection settings stay readable in `params`.
    - llm_models: one row per LiteLLM Router deployment. `alias` is
      deliberately non-unique - repeated aliases form a load-balanced pool.
    - llm_router_config: a single seeded row holding Router-wide settings.
    """
    create_table(
        PROVIDERS_TABLE,
        Column("id", Integer, primary_key=True),
        Column("uuid", UUIDType(binary=True), nullable=False, unique=True),
        Column("name", String(250), nullable=False, unique=True),
        Column("provider_key", String(100), nullable=False),
        Column("params", Text, nullable=True),
        # LargeBinary (bytea on Postgres), matching what encrypted_field_factory
        # produces in the ORM: EncryptedType stores ciphertext as bytes. Text
        # here would appear to work on SQLite, whose type affinity round-trips a
        # str, and then fail on every read under Postgres with
        # "TypeError: string argument without an encoding". Zobi already hit
        # this on dbs.encrypted_extra, fixed in c2acd2cf3df2.
        Column("encrypted_params", LargeBinary, nullable=True),
        Column("is_active", Boolean, nullable=False, server_default="1"),
        Column("last_tested_at", DateTime, nullable=True),
        Column("last_test_error", Text, nullable=True),
        # AuditMixinNullable columns
        Column("created_on", DateTime, nullable=True),
        Column("changed_on", DateTime, nullable=True),
        Column("created_by_fk", Integer, nullable=True),
        Column("changed_by_fk", Integer, nullable=True),
    )

    create_index(PROVIDERS_TABLE, "idx_llm_providers_uuid", ["uuid"], unique=True)
    create_index(PROVIDERS_TABLE, "idx_llm_providers_key", ["provider_key"])

    create_fks_for_table(
        foreign_key_name="fk_llm_providers_created_by_fk_ab_user",
        table_name=PROVIDERS_TABLE,
        referenced_table="ab_user",
        local_cols=["created_by_fk"],
        remote_cols=["id"],
        ondelete="SET NULL",
    )
    create_fks_for_table(
        foreign_key_name="fk_llm_providers_changed_by_fk_ab_user",
        table_name=PROVIDERS_TABLE,
        referenced_table="ab_user",
        local_cols=["changed_by_fk"],
        remote_cols=["id"],
        ondelete="SET NULL",
    )

    create_table(
        MODELS_TABLE,
        Column("id", Integer, primary_key=True),
        Column("uuid", UUIDType(binary=True), nullable=False, unique=True),
        Column("provider_id", Integer, nullable=False),
        # Not unique: two rows sharing an alias are a load-balanced pool.
        Column("alias", String(250), nullable=False),
        Column("model_string", String(500), nullable=False),
        Column("supports_chat", Boolean, nullable=False, server_default="1"),
        Column("supports_transcription", Boolean, nullable=False, server_default="0"),
        Column("supports_embeddings", Boolean, nullable=False, server_default="0"),
        Column("supports_vision", Boolean, nullable=False, server_default="0"),
        Column("tpm", Integer, nullable=True),
        Column("rpm", Integer, nullable=True),
        Column("max_parallel_requests", Integer, nullable=True),
        Column("max_budget", Float, nullable=True),
        Column("budget_duration", String(50), nullable=True),
        Column("extra_params", Text, nullable=True),
        Column("is_active", Boolean, nullable=False, server_default="1"),
        # AuditMixinNullable columns
        Column("created_on", DateTime, nullable=True),
        Column("changed_on", DateTime, nullable=True),
        Column("created_by_fk", Integer, nullable=True),
        Column("changed_by_fk", Integer, nullable=True),
    )

    create_index(MODELS_TABLE, "idx_llm_models_uuid", ["uuid"], unique=True)
    create_index(MODELS_TABLE, "idx_llm_models_alias", ["alias"])
    create_index(MODELS_TABLE, "idx_llm_models_provider_id", ["provider_id"])

    create_fks_for_table(
        foreign_key_name="fk_llm_models_provider_id_llm_providers",
        table_name=MODELS_TABLE,
        referenced_table=PROVIDERS_TABLE,
        local_cols=["provider_id"],
        remote_cols=["id"],
        ondelete="CASCADE",
    )
    create_fks_for_table(
        foreign_key_name="fk_llm_models_created_by_fk_ab_user",
        table_name=MODELS_TABLE,
        referenced_table="ab_user",
        local_cols=["created_by_fk"],
        remote_cols=["id"],
        ondelete="SET NULL",
    )
    create_fks_for_table(
        foreign_key_name="fk_llm_models_changed_by_fk_ab_user",
        table_name=MODELS_TABLE,
        referenced_table="ab_user",
        local_cols=["changed_by_fk"],
        remote_cols=["id"],
        ondelete="SET NULL",
    )

    create_table(
        ROUTER_CONFIG_TABLE,
        Column("id", Integer, primary_key=True),
        Column(
            "routing_strategy",
            String(50),
            nullable=False,
            server_default="simple-shuffle",
        ),
        Column("num_retries", Integer, nullable=True),
        Column("timeout", Integer, nullable=True),
        Column("cooldown_time", Integer, nullable=True),
        Column("default_max_parallel_requests", Integer, nullable=True),
        Column("fallbacks", Text, nullable=True),
        Column("default_chat_alias", String(250), nullable=True),
        Column("default_transcription_alias", String(250), nullable=True),
        Column("default_embedding_alias", String(250), nullable=True),
        # AuditMixinNullable columns
        Column("created_on", DateTime, nullable=True),
        Column("changed_on", DateTime, nullable=True),
        Column("created_by_fk", Integer, nullable=True),
        Column("changed_by_fk", Integer, nullable=True),
    )

    create_fks_for_table(
        foreign_key_name="fk_llm_router_config_created_by_fk_ab_user",
        table_name=ROUTER_CONFIG_TABLE,
        referenced_table="ab_user",
        local_cols=["created_by_fk"],
        remote_cols=["id"],
        ondelete="SET NULL",
    )
    create_fks_for_table(
        foreign_key_name="fk_llm_router_config_changed_by_fk_ab_user",
        table_name=ROUTER_CONFIG_TABLE,
        referenced_table="ab_user",
        local_cols=["changed_by_fk"],
        remote_cols=["id"],
        ondelete="SET NULL",
    )

    # Seed the singleton so the settings screen has a row to read on a fresh
    # install. The DAO recreates it if absent, but seeding keeps id == 1
    # deterministic across environments.
    op.execute(
        f"INSERT INTO {ROUTER_CONFIG_TABLE} "  # noqa: S608
        "(id, routing_strategy, num_retries, fallbacks) "
        "VALUES (1, 'simple-shuffle', 2, '[]')"
    )


def downgrade():
    # drop_table drops the table's foreign keys first, so they need no
    # separate handling here. Models go before providers because of the FK
    # between them.
    drop_table(ROUTER_CONFIG_TABLE)

    drop_index(MODELS_TABLE, "idx_llm_models_provider_id")
    drop_index(MODELS_TABLE, "idx_llm_models_alias")
    drop_index(MODELS_TABLE, "idx_llm_models_uuid")
    drop_table(MODELS_TABLE)

    drop_index(PROVIDERS_TABLE, "idx_llm_providers_key")
    drop_index(PROVIDERS_TABLE, "idx_llm_providers_uuid")
    drop_table(PROVIDERS_TABLE)
