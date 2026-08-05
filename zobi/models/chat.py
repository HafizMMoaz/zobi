"""ORM models for Zobi agent conversations.

Messages are stored in the shape LiteLLM expects (``role``, ``content``,
``tool_calls``, ``tool_call_id``) so replaying a conversation into the model is
a direct mapping rather than a translation. The UI needs a little more than
that, which lives in ``extra``.
"""

from __future__ import annotations

import uuid as uuid_module
from typing import Any

from flask_appbuilder import Model
from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy_utils import UUIDType

from zobi.models.helpers import AuditMixinNullable
from zobi.utils import json


class Conversation(AuditMixinNullable, Model):
    """One chat thread, owned by the user who started it.

    Conversations are private: the agent acts as its owner and the transcript
    can quote data that only they may see, so there is no sharing model here.
    """

    __tablename__ = "zobi_conversations"

    id = Column(Integer, primary_key=True)
    uuid = Column(
        UUIDType(binary=True), nullable=False, unique=True, default=uuid_module.uuid4
    )

    user_id = Column(Integer, ForeignKey("ab_user.id"), nullable=False, index=True)
    title = Column(String(250), nullable=True)

    #: Autonomy granted for this thread. Stored per conversation rather than
    #: per user so a throwaway "just look" chat cannot inherit the elevated
    #: mode of an earlier one.
    mode = Column(String(20), nullable=False, default="manual")

    #: Alias override; NULL means the instance default for chat.
    model_alias = Column(String(250), nullable=True)

    is_archived = Column(Boolean, nullable=False, default=False)

    messages = relationship(
        "ChatMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ChatMessage.id",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Conversation {self.id} {self.title!r}>"


class ChatMessage(AuditMixinNullable, Model):
    """A single message. Roles follow the OpenAI convention LiteLLM uses."""

    __tablename__ = "zobi_chat_messages"

    id = Column(Integer, primary_key=True)
    uuid = Column(
        UUIDType(binary=True), nullable=False, unique=True, default=uuid_module.uuid4
    )

    conversation_id = Column(
        Integer,
        ForeignKey("zobi_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # "user" | "assistant" | "tool" | "system"
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=True)

    #: JSON list of tool calls an assistant message is requesting.
    tool_calls = Column(Text, nullable=True)
    #: Set on a tool result, linking it to the call it answers.
    tool_call_id = Column(String(128), nullable=True)
    #: Tool name, kept alongside the id so the UI can label a result without
    #: walking back through the transcript to find the matching call.
    tool_name = Column(String(128), nullable=True)

    #: UI-only detail: approval state, risk level, error flags, timings.
    #: Deliberately excluded from what is replayed to the model.
    extra = Column(Text, nullable=True)

    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self) -> str:
        return f"<ChatMessage {self.id} {self.role}>"

    @property
    def tool_calls_list(self) -> list[dict[str, Any]]:
        if not self.tool_calls:
            return []
        try:
            value = json.loads(self.tool_calls)
        except (json.JSONDecodeError, TypeError):
            return []
        return value if isinstance(value, list) else []

    @property
    def extra_dict(self) -> dict[str, Any]:
        if not self.extra:
            return {}
        try:
            value = json.loads(self.extra)
        except (json.JSONDecodeError, TypeError):
            return {}
        return value if isinstance(value, dict) else {}

    def to_model_message(self) -> dict[str, Any]:
        """The message as LiteLLM expects it when replaying history.

        ``extra`` is omitted on purpose: it is presentation state, and feeding
        it back would spend tokens on information the model cannot use.
        """
        message: dict[str, Any] = {"role": self.role}

        if self.role == "tool":
            message["tool_call_id"] = self.tool_call_id or ""
            message["content"] = self.content or ""
            return message

        message["content"] = self.content or ""
        if calls := self.tool_calls_list:
            message["tool_calls"] = calls
        return message

    def to_dict(self) -> dict[str, Any]:
        """The message as the chat UI needs it."""
        return {
            "id": self.id,
            "uuid": str(self.uuid),
            "role": self.role,
            "content": self.content,
            "tool_calls": self.tool_calls_list,
            "tool_call_id": self.tool_call_id,
            "tool_name": self.tool_name,
            "extra": self.extra_dict,
            "created_on": self.created_on.isoformat() if self.created_on else None,
        }


class ChatAttachment(AuditMixinNullable, Model):
    """A file a user attached to a conversation.

    The row is created when the bytes are uploaded, which happens *before* the
    message that references them is sent, so ``message_id`` starts NULL and is
    filled in when the message is created. Processing (parsing a CSV, reading a
    PDF) happens after the upload responds, hence the ``status`` field: the row
    outlives a failed extraction so the UI can explain what went wrong.

    The bytes themselves live on disk, not here. ``zobi.agent.attachments``
    owns that side and is the only thing that should build ``storage_path``.
    """

    __tablename__ = "zobi_chat_attachments"

    id = Column(Integer, primary_key=True)
    uuid = Column(
        UUIDType(binary=True), nullable=False, unique=True, default=uuid_module.uuid4
    )

    conversation_id = Column(
        Integer,
        ForeignKey("zobi_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    #: NULL until the message that carries this attachment is written. On
    #: delete the link is cleared rather than cascaded: dropping a single
    #: message must not silently orphan a file on disk, and deleting the
    #: conversation already removes the attachment through its own FK.
    message_id = Column(
        Integer,
        ForeignKey("zobi_chat_messages.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    #: The name the browser sent. A display label only; it never reaches the
    #: filesystem, which is keyed by ``uuid``.
    filename = Column(String(255), nullable=False)
    #: The content type the client claimed. Kept for display and debugging;
    #: ``kind`` is what the rest of the system trusts.
    content_type = Column(String(255), nullable=True)
    size_bytes = Column(Integer, nullable=False)

    #: "csv" | "sql" | "pdf" | "image" | "other", sniffed from the leading
    #: bytes rather than taken from the filename or the declared MIME type.
    kind = Column(String(20), nullable=False)

    #: Absolute path to the stored bytes. Derived from ``uuid``, never from
    #: anything the client supplied.
    storage_path = Column(String(1024), nullable=False)

    #: "pending" | "ready" | "failed"
    status = Column(String(20), nullable=False, default="pending")
    #: Why extraction failed, in terms a user can act on. Never file content.
    error = Column(Text, nullable=True)

    #: JSON: whatever the processor made of the file, eg detected columns and
    #: row count for a CSV, or extracted text for a PDF.
    extract = Column(Text, nullable=True)

    conversation = relationship("Conversation")

    def __repr__(self) -> str:
        return f"<ChatAttachment {self.id} {self.kind} {self.status}>"

    @property
    def extract_dict(self) -> dict[str, Any]:
        if not self.extract:
            return {}
        try:
            value = json.loads(self.extract)
        except (json.JSONDecodeError, TypeError):
            return {}
        return value if isinstance(value, dict) else {}

    def to_dict(self) -> dict[str, Any]:
        """The attachment as the chat UI needs it.

        ``storage_path`` is deliberately absent: it is a server-side detail,
        and publishing the layout of the attachment directory helps nobody who
        is allowed to read the file anyway.
        """
        return {
            "id": self.id,
            "uuid": str(self.uuid),
            "conversation_id": self.conversation_id,
            "message_id": self.message_id,
            "filename": self.filename,
            "content_type": self.content_type,
            "size_bytes": self.size_bytes,
            "kind": self.kind,
            "status": self.status,
            "error": self.error,
            "extract": self.extract_dict,
            "created_on": self.created_on.isoformat() if self.created_on else None,
        }
