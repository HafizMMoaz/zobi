"""Create zobi_chat_attachments for files attached to agent conversations

Revision ID: b8f3c1d59e47
Revises: d4e8b71a02cf
Create Date: 2026-08-05 01:00:00.000000

"""

from sqlalchemy import (
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
revision = "b8f3c1d59e47"
down_revision = "d4e8b71a02cf"

ATTACHMENTS_TABLE = "zobi_chat_attachments"
CONVERSATIONS_TABLE = "zobi_conversations"
MESSAGES_TABLE = "zobi_chat_messages"


def upgrade():
    """
    Create the store for files attached to a conversation.

    Only metadata lives here; the bytes are written to disk under the
    attachment's uuid. `filename` is the label the browser sent and is never
    used to build a path.

    `message_id` is nullable because a file is uploaded before the message
    that carries it exists, and it is cleared rather than cascaded on delete
    so removing one message cannot orphan a file on disk. Deleting the
    conversation still removes the row through `conversation_id`.
    """
    create_table(
        ATTACHMENTS_TABLE,
        Column("id", Integer, primary_key=True),
        Column("uuid", UUIDType(binary=True), nullable=False, unique=True),
        Column("conversation_id", Integer, nullable=False),
        Column("message_id", Integer, nullable=True),
        # Display label only. The path on disk comes from `uuid`.
        Column("filename", String(255), nullable=False),
        # What the client claimed. `kind` is what the system trusts.
        Column("content_type", String(255), nullable=True),
        Column("size_bytes", Integer, nullable=False),
        # "csv" | "sql" | "pdf" | "image" | "other", sniffed from the bytes.
        Column("kind", String(20), nullable=False),
        Column("storage_path", String(1024), nullable=False),
        # "pending" | "ready" | "failed"
        Column("status", String(20), nullable=False, server_default="pending"),
        Column("error", Text, nullable=True),
        # JSON produced by the processor: columns, row counts, extracted text.
        Column("extract", Text, nullable=True),
        # AuditMixinNullable columns
        Column("created_on", DateTime, nullable=True),
        Column("changed_on", DateTime, nullable=True),
        Column("created_by_fk", Integer, nullable=True),
        Column("changed_by_fk", Integer, nullable=True),
    )

    create_index(ATTACHMENTS_TABLE, "idx_zobi_att_uuid", ["uuid"], unique=True)
    create_index(ATTACHMENTS_TABLE, "idx_zobi_att_conversation", ["conversation_id"])
    create_index(ATTACHMENTS_TABLE, "idx_zobi_att_message", ["message_id"])

    create_fks_for_table(
        foreign_key_name="fk_zobi_att_conversation_id",
        table_name=ATTACHMENTS_TABLE,
        referenced_table=CONVERSATIONS_TABLE,
        local_cols=["conversation_id"],
        remote_cols=["id"],
        ondelete="CASCADE",
    )
    create_fks_for_table(
        foreign_key_name="fk_zobi_att_message_id",
        table_name=ATTACHMENTS_TABLE,
        referenced_table=MESSAGES_TABLE,
        local_cols=["message_id"],
        remote_cols=["id"],
        ondelete="SET NULL",
    )
    for column in ("created_by_fk", "changed_by_fk"):
        create_fks_for_table(
            foreign_key_name=f"fk_zobi_att_{column}_ab_user",
            table_name=ATTACHMENTS_TABLE,
            referenced_table="ab_user",
            local_cols=[column],
            remote_cols=["id"],
            ondelete="SET NULL",
        )


def downgrade():
    drop_index(ATTACHMENTS_TABLE, "idx_zobi_att_message")
    drop_index(ATTACHMENTS_TABLE, "idx_zobi_att_conversation")
    drop_index(ATTACHMENTS_TABLE, "idx_zobi_att_uuid")
    drop_table(ATTACHMENTS_TABLE)
