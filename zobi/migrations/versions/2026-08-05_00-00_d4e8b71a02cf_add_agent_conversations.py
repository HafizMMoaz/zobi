"""Create zobi_conversations and zobi_chat_messages for the Zobi agent

Revision ID: d4e8b71a02cf
Revises: c7a1f92be3d4
Create Date: 2026-08-05 00:00:00.000000

"""

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
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
revision = "d4e8b71a02cf"
down_revision = "c7a1f92be3d4"

CONVERSATIONS_TABLE = "zobi_conversations"
MESSAGES_TABLE = "zobi_chat_messages"


def upgrade():
    """
    Create the agent's conversation store.

    Conversations belong to a single user and are never shared: the agent acts
    as its owner, so a transcript can quote data nobody else may see.

    Messages are stored in the shape LiteLLM replays, with UI-only state kept
    apart in `extra` so it is never fed back to the model.
    """
    create_table(
        CONVERSATIONS_TABLE,
        Column("id", Integer, primary_key=True),
        Column("uuid", UUIDType(binary=True), nullable=False, unique=True),
        Column("user_id", Integer, nullable=False),
        Column("title", String(250), nullable=True),
        # Autonomy is per conversation, not per user, so a throwaway thread
        # cannot inherit an elevated mode from an earlier one.
        Column("mode", String(20), nullable=False, server_default="manual"),
        Column("model_alias", String(250), nullable=True),
        Column("is_archived", Boolean, nullable=False, server_default="0"),
        # AuditMixinNullable columns
        Column("created_on", DateTime, nullable=True),
        Column("changed_on", DateTime, nullable=True),
        Column("created_by_fk", Integer, nullable=True),
        Column("changed_by_fk", Integer, nullable=True),
    )

    create_index(CONVERSATIONS_TABLE, "idx_zobi_conv_uuid", ["uuid"], unique=True)
    create_index(CONVERSATIONS_TABLE, "idx_zobi_conv_user", ["user_id"])
    create_index(CONVERSATIONS_TABLE, "idx_zobi_conv_changed", ["changed_on"])

    create_fks_for_table(
        foreign_key_name="fk_zobi_conv_user_id_ab_user",
        table_name=CONVERSATIONS_TABLE,
        referenced_table="ab_user",
        local_cols=["user_id"],
        remote_cols=["id"],
        ondelete="CASCADE",
    )
    for column in ("created_by_fk", "changed_by_fk"):
        create_fks_for_table(
            foreign_key_name=f"fk_zobi_conv_{column}_ab_user",
            table_name=CONVERSATIONS_TABLE,
            referenced_table="ab_user",
            local_cols=[column],
            remote_cols=["id"],
            ondelete="SET NULL",
        )

    create_table(
        MESSAGES_TABLE,
        Column("id", Integer, primary_key=True),
        Column("uuid", UUIDType(binary=True), nullable=False, unique=True),
        Column("conversation_id", Integer, nullable=False),
        Column("role", String(20), nullable=False),
        Column("content", Text, nullable=True),
        Column("tool_calls", Text, nullable=True),
        Column("tool_call_id", String(128), nullable=True),
        Column("tool_name", String(128), nullable=True),
        # UI-only state: approval outcome, risk level, error flags.
        Column("extra", Text, nullable=True),
        # AuditMixinNullable columns
        Column("created_on", DateTime, nullable=True),
        Column("changed_on", DateTime, nullable=True),
        Column("created_by_fk", Integer, nullable=True),
        Column("changed_by_fk", Integer, nullable=True),
    )

    create_index(MESSAGES_TABLE, "idx_zobi_msg_uuid", ["uuid"], unique=True)
    create_index(MESSAGES_TABLE, "idx_zobi_msg_conversation", ["conversation_id"])

    create_fks_for_table(
        foreign_key_name="fk_zobi_msg_conversation_id",
        table_name=MESSAGES_TABLE,
        referenced_table=CONVERSATIONS_TABLE,
        local_cols=["conversation_id"],
        remote_cols=["id"],
        ondelete="CASCADE",
    )
    for column in ("created_by_fk", "changed_by_fk"):
        create_fks_for_table(
            foreign_key_name=f"fk_zobi_msg_{column}_ab_user",
            table_name=MESSAGES_TABLE,
            referenced_table="ab_user",
            local_cols=[column],
            remote_cols=["id"],
            ondelete="SET NULL",
        )


def downgrade():
    # Messages first: they carry the foreign key to conversations.
    drop_index(MESSAGES_TABLE, "idx_zobi_msg_conversation")
    drop_index(MESSAGES_TABLE, "idx_zobi_msg_uuid")
    drop_table(MESSAGES_TABLE)

    drop_index(CONVERSATIONS_TABLE, "idx_zobi_conv_changed")
    drop_index(CONVERSATIONS_TABLE, "idx_zobi_conv_user")
    drop_index(CONVERSATIONS_TABLE, "idx_zobi_conv_uuid")
    drop_table(CONVERSATIONS_TABLE)
