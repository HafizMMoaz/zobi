"""HTTP surface for the Zobi agent.

Conversations are ordinary CRUD. The interesting endpoint is ``stream``, which
returns Server-Sent Events so tokens and tool activity reach the browser as
they happen rather than after the whole turn.

Every route scopes to the current user. Conversations are private, and a
transcript can quote data only its owner may see.
"""

from __future__ import annotations

import logging
from typing import Any

from flask import current_app, g, request, Response, stream_with_context
from flask_appbuilder.api import BaseApi, expose, protect, safe
from marshmallow import fields, Schema, ValidationError
from marshmallow.validate import Length, OneOf

from zobi.agent.permissions import (
    AgentMode,
    MODE_DESCRIPTIONS,
    MODE_LABELS,
    parse_mode,
)
from zobi.agent.runtime import AgentTurn, TurnEvent
from zobi.agent.tools import call_tool, find_tool, list_tools
from zobi.extensions import db, event_logger
from zobi.llm.service import NoModelForCapabilityError, resolve_alias
from zobi.models.chat import ChatAttachment, ChatMessage, Conversation
from zobi.models.llm import LLMModel, LLMProvider
from zobi.utils.core import get_user_id
from zobi.utils.decorators import transaction
from zobi.views.base_api import BaseZobiApiMixin, statsd_metrics

logger = logging.getLogger(__name__)

#: A first message is used as the thread title, trimmed to something that fits
#: a sidebar.
TITLE_LENGTH = 60


class MessageSchema(Schema):
    content = fields.String(required=True, validate=Length(1, 32000))
    mode = fields.String(
        validate=OneOf([mode.value for mode in AgentMode]), load_default=None
    )
    model_alias = fields.String(allow_none=True, load_default=None)


class ApprovalSchema(Schema):
    tool_call_id = fields.String(required=True, validate=Length(1, 128))
    tool_name = fields.String(required=True, validate=Length(1, 128))
    arguments = fields.Dict(load_default=dict)
    approved = fields.Boolean(required=True)


class ConversationSchema(Schema):
    title = fields.String(allow_none=True, validate=Length(0, 250))
    mode = fields.String(validate=OneOf([mode.value for mode in AgentMode]))
    model_alias = fields.String(allow_none=True)
    is_archived = fields.Boolean()


def _owned(conversation_id: int) -> Conversation | None:
    """Fetch a conversation, but only if it belongs to the caller."""
    return (
        db.session.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == get_user_id(),
        )
        .first()
    )


def _attachment_payload(attachment: ChatAttachment) -> dict[str, Any]:
    """Shape an attachment for the chat UI.

    Lifts ``summary`` out of the processor's ``extract`` blob to the top level.
    The UI shows one line per file and should not have to know that a CSV's
    summary lives in a different place from a PDF's; the full extract stays
    available for anything that wants the detail.
    """
    payload = attachment.to_dict()
    payload["summary"] = (payload.get("extract") or {}).get("summary")
    return payload


def _history(conversation: Conversation) -> list[dict[str, Any]]:
    return [message.to_model_message() for message in conversation.messages]


def chat_aliases() -> list[str]:
    """Every distinct alias that can currently serve a chat completion.

    Distinct aliases rather than model rows: LLMModel.alias is deliberately not
    unique, because LiteLLM load balances across every deployment sharing a
    model_name. Picking an alias is picking a pool, not a deployment.
    """
    rows = (
        db.session.query(LLMModel.alias)
        .join(LLMProvider)
        .filter(
            LLMModel.is_active.is_(True),
            LLMProvider.is_active.is_(True),
            LLMModel.supports_chat.is_(True),
        )
        .distinct()
        .order_by(LLMModel.alias)
        .all()
    )
    return [row[0] for row in rows]


def _persist(
    conversation: Conversation,
    role: str,
    content: str | None = None,
    **kwargs: Any,
) -> ChatMessage:
    message = ChatMessage(
        conversation_id=conversation.id, role=role, content=content, **kwargs
    )
    db.session.add(message)
    db.session.flush()
    return message


class ZobiAgentRestApi(BaseZobiApiMixin, BaseApi):
    """Conversations and the streaming turn endpoint.

    The mixin supplies the statsd plumbing that ``@statsd_metrics`` expects;
    plain ``BaseApi`` has none, and every decorated route 500s without it.
    """

    resource_name = "zobi_agent"
    allow_browser_login = True
    openapi_spec_tag = "Zobi Agent"
    # Not a model-backed API: every route filters to the current user rather
    # than relying on FAB's model permissions.
    class_permission_name = "ZobiAgent"

    @expose("/modes/", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    def modes(self) -> Response:
        """List the autonomy modes and what each one permits.

        Served from the backend so the labels and the enforcement can never
        drift apart.
        ---
        get:
          summary: List agent autonomy modes
          responses:
            200:
              description: Available modes
              content:
                application/json:
                  schema:
                    type: object
        """
        return self.response(
            200,
            result=[
                {
                    "value": mode.value,
                    "label": MODE_LABELS[mode],
                    "description": MODE_DESCRIPTIONS[mode],
                }
                for mode in AgentMode
            ],
        )

    @expose("/tools/", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    def tools(self) -> Response:
        """List the tools available in a given mode.

        Lets the UI show what Zobi can currently do, which is the clearest way
        to explain what a mode actually changes.
        ---
        get:
          summary: List agent tools
          responses:
            200:
              description: Tools available in the requested mode
              content:
                application/json:
                  schema:
                    type: object
        """
        mode = parse_mode(request.args.get("mode"))
        return self.response(
            200,
            result=[
                {
                    "name": tool.name,
                    "title": tool.title,
                    "risk": tool.risk.value,
                    "description": tool.description[:300],
                }
                for tool in list_tools(mode)
            ],
        )

    @expose("/models/", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    def models(self) -> Response:
        """List the models a conversation may be pointed at.

        Served here rather than from the gateway's own API because those routes
        are part of the Manage screen: choosing a model in chat must not require
        permission to administer providers.
        ---
        get:
          summary: List selectable chat models
          responses:
            200:
              description: Aliases that can serve a chat completion
              content:
                application/json:
                  schema:
                    type: object
        """
        aliases = chat_aliases()
        try:
            default = resolve_alias("chat")
        except NoModelForCapabilityError:
            # Nothing is configured yet. An empty picker is the right answer,
            # not a 500.
            default = None

        return self.response(
            200,
            result=[
                {"alias": alias, "is_default": alias == default} for alias in aliases
            ],
        )

    @expose("/conversation/", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    def list_conversations(self) -> Response:
        """List the caller's conversations, most recently active first.
        ---
        get:
          summary: List conversations
          responses:
            200:
              description: Conversations
              content:
                application/json:
                  schema:
                    type: object
        """
        conversations = (
            db.session.query(Conversation)
            .filter(
                Conversation.user_id == get_user_id(),
                Conversation.is_archived.is_(False),
            )
            .order_by(Conversation.changed_on.desc())
            .limit(100)
            .all()
        )
        return self.response(
            200,
            result=[
                {
                    "id": conversation.id,
                    "uuid": str(conversation.uuid),
                    "title": conversation.title,
                    "mode": conversation.mode,
                    "model_alias": conversation.model_alias,
                    "changed_on": (
                        conversation.changed_on.isoformat()
                        if conversation.changed_on
                        else None
                    ),
                }
                for conversation in conversations
            ],
        )

    @expose("/conversation/", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    @transaction()
    def create_conversation(self) -> Response:
        """Start a conversation.
        ---
        post:
          summary: Create a conversation
          responses:
            201:
              description: Conversation created
              content:
                application/json:
                  schema:
                    type: object
        """
        try:
            item = ConversationSchema().load(request.json or {})
        except ValidationError as error:
            return self.response_400(message=error.messages)

        conversation = Conversation(
            user_id=get_user_id(),
            title=item.get("title"),
            mode=item.get("mode", AgentMode.MANUAL.value),
            model_alias=item.get("model_alias"),
        )
        db.session.add(conversation)
        db.session.flush()
        return self.response(201, id=conversation.id, uuid=str(conversation.uuid))

    @expose("/conversation/<int:pk>", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    def get_conversation(self, pk: int) -> Response:
        """Fetch a conversation and its full transcript.
        ---
        get:
          summary: Get a conversation
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            200:
              description: Conversation with messages
              content:
                application/json:
                  schema:
                    type: object
            404:
              $ref: '#/components/responses/404'
        """
        conversation = _owned(pk)
        if not conversation:
            return self.response_404()

        return self.response(
            200,
            result={
                "id": conversation.id,
                "uuid": str(conversation.uuid),
                "title": conversation.title,
                "mode": conversation.mode,
                "model_alias": conversation.model_alias,
                "messages": [
                    message.to_dict()
                    for message in conversation.messages
                    # System messages are an implementation detail of the
                    # prompt and would only confuse the transcript.
                    if message.role != "system"
                ],
            },
        )

    @expose("/conversation/<int:pk>", methods=("PUT",))
    @protect()
    @safe
    @statsd_metrics
    @transaction()
    def update_conversation(self, pk: int) -> Response:
        """Rename, archive, or change the mode or model of a conversation.
        ---
        put:
          summary: Update a conversation
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            200:
              description: Conversation updated
              content:
                application/json:
                  schema:
                    type: object
            404:
              $ref: '#/components/responses/404'
        """
        conversation = _owned(pk)
        if not conversation:
            return self.response_404()

        try:
            item = ConversationSchema().load(request.json or {})
        except ValidationError as error:
            return self.response_400(message=error.messages)

        for key, value in item.items():
            setattr(conversation, key, value)
        return self.response(200, result={"id": conversation.id})

    @expose("/conversation/<int:pk>", methods=("DELETE",))
    @protect()
    @safe
    @statsd_metrics
    @transaction()
    def delete_conversation(self, pk: int) -> Response:
        """Delete a conversation and its messages.
        ---
        delete:
          summary: Delete a conversation
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            200:
              description: Conversation deleted
              content:
                application/json:
                  schema:
                    type: object
            404:
              $ref: '#/components/responses/404'
        """
        conversation = _owned(pk)
        if not conversation:
            return self.response_404()
        db.session.delete(conversation)
        return self.response(200, message="OK")

    @expose("/conversation/<int:pk>/stream", methods=("POST",))
    @protect()
    @safe
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.stream",
        log_to_statsd=False,
    )
    def stream(self, pk: int) -> Response:
        """Send a message and stream Zobi's reply.

        Returns Server-Sent Events: ``token`` as text arrives, ``tool_start``
        and ``tool_result`` around each tool, ``approval_required`` when the
        turn pauses for consent, then ``done``.
        ---
        post:
          summary: Send a message and stream the reply
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            200:
              description: Server-sent event stream
              content:
                text/event-stream:
                  schema:
                    type: string
            404:
              $ref: '#/components/responses/404'
        """
        conversation = _owned(pk)
        if not conversation:
            return self.response_404()

        try:
            item = MessageSchema().load(request.json or {})
        except ValidationError as error:
            return self.response_400(message=error.messages)

        if item.get("mode"):
            conversation.mode = item["mode"]
        if item.get("model_alias") is not None:
            conversation.model_alias = item["model_alias"]

        _persist(conversation, "user", item["content"])
        if not conversation.title:
            title = item["content"].strip().splitlines()[0]
            conversation.title = title[:TITLE_LENGTH]

        history = _history(conversation)
        mode = parse_mode(conversation.mode)
        alias = conversation.model_alias
        conversation_id = conversation.id
        # Not @transaction(): that decorator commits when the view returns, and
        # this view returns as soon as the streaming Response is constructed,
        # while the turn itself is still to run. The user's message has to be
        # durable before then, and the transaction must not stay open for the
        # lifetime of the stream.
        db.session.commit()  # pylint: disable=consider-using-transaction

        # The generator runs after the view returns, so anything it needs from
        # the request context has to be captured now. `g.user` in particular:
        # the MCP auth layer reads it to decide who the tools act as.
        user = g.user
        app = current_app._get_current_object()  # noqa: SLF001

        def generate() -> Any:
            with app.app_context():
                g.user = user
                turn = AgentTurn(history, mode, alias)
                try:
                    for event in turn.run():
                        yield event.to_sse()
                        self._record(conversation_id, event)
                except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
                    logger.exception("Agent turn failed: %s", type(ex).__name__)
                    yield TurnEvent("error", {"message": str(ex)}).to_sse()
                finally:
                    # Runs after the view has returned, so no view-level
                    # decorator is still in scope to commit this.
                    db.session.commit()  # pylint: disable=consider-using-transaction

        return Response(
            stream_with_context(generate()),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                # Without this, nginx buffers the whole response and the
                # stream arrives as one lump when the turn finishes.
                "X-Accel-Buffering": "no",
            },
        )

    @staticmethod
    def _record(conversation_id: int, event: TurnEvent) -> None:
        """Persist the parts of a turn worth keeping.

        Tokens are skipped: they are reassembled into the message_complete
        event, and writing each one would mean a row per token.
        """
        from zobi.utils import json as json_utils  # noqa: PLC0415

        if event.type == "message_complete":
            calls = event.data.get("tool_calls") or []
            db.session.add(
                ChatMessage(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=event.data.get("content") or "",
                    tool_calls=json_utils.dumps(calls) if calls else None,
                )
            )
        elif event.type == "tool_result":
            db.session.add(
                ChatMessage(
                    conversation_id=conversation_id,
                    role="tool",
                    content=event.data.get("output") or "",
                    tool_call_id=event.data.get("id"),
                    tool_name=event.data.get("name"),
                    extra=json_utils.dumps({"ok": event.data.get("ok", True)}),
                )
            )
        elif event.type == "approval_required":
            db.session.add(
                ChatMessage(
                    conversation_id=conversation_id,
                    role="tool",
                    content="",
                    tool_call_id=event.data.get("id"),
                    tool_name=event.data.get("name"),
                    extra=json_utils.dumps({"awaiting_approval": True, **event.data}),
                )
            )

    @expose("/conversation/<int:pk>/approve", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    @transaction()
    def approve(self, pk: int) -> Response:
        """Approve or decline a paused tool call.

        Records the outcome as the pending call's result, so the next turn
        continues from a well formed transcript. A declined call still gets a
        result: an unanswered tool call makes providers reject the next
        request outright.
        ---
        post:
          summary: Approve or decline a pending tool call
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            200:
              description: Decision recorded
              content:
                application/json:
                  schema:
                    type: object
            404:
              $ref: '#/components/responses/404'
        """
        conversation = _owned(pk)
        if not conversation:
            return self.response_404()

        try:
            item = ApprovalSchema().load(request.json or {})
        except ValidationError as error:
            return self.response_400(message=error.messages)

        pending = next(
            (
                message
                for message in reversed(conversation.messages)
                if message.tool_call_id == item["tool_call_id"]
                and message.extra_dict.get("awaiting_approval")
            ),
            None,
        )
        if pending is None:
            return self.response_404()

        if not item["approved"]:
            pending.content = "The user declined this action."
            pending.extra = None
            return self.response(200, result={"ok": False, "declined": True})

        mode = parse_mode(conversation.mode)
        if find_tool(item["tool_name"], mode) is None:
            # Re-checked at execution time: the mode may have been tightened
            # between the model proposing the call and the user approving it.
            pending.content = f"'{item['tool_name']}' is not available in this mode."
            pending.extra = None
            return self.response(200, result={"ok": False})

        ok, output = call_tool(item["tool_name"], item["arguments"])
        pending.content = output
        pending.extra = None
        return self.response(200, result={"ok": ok, "output": output[:4000]})

    @expose("/conversation/<int:pk>/attachment", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    @transaction()
    def upload_attachment(self, pk: int) -> Response:
        """Attach a file to a conversation.

        Stores the bytes, then extracts a structured summary so the model has
        something to reason about. Extraction failures do not fail the upload:
        the row is kept with status "failed" and its error, because telling the
        user "this PDF is password protected" is more useful than losing the
        file and showing nothing.
        ---
        post:
          summary: Upload a chat attachment
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            201:
              description: Attachment stored
              content:
                application/json:
                  schema:
                    type: object
            400:
              $ref: '#/components/responses/400'
            404:
              $ref: '#/components/responses/404'
        """
        from zobi.agent import attachments as store  # noqa: PLC0415
        from zobi.agent.processors import (  # noqa: PLC0415
            process_attachment,
            ProcessorError,
        )

        conversation = _owned(pk)
        if not conversation:
            return self.response_404()

        upload = request.files.get("file")
        if upload is None:
            return self.response_400(message="No file was supplied.")

        try:
            attachment = store.save_upload(pk, upload)
        except store.AttachmentTooLargeError as ex:
            return self.response(413, message=str(ex))
        except store.AttachmentError as ex:
            return self.response_400(message=str(ex))

        try:
            extract = process_attachment(
                store.load_bytes(attachment), attachment.filename
            )
            store.mark_ready(attachment, extract)
        except ProcessorError as ex:
            store.mark_failed(attachment, str(ex))
        except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
            # Type only: a processor error message can quote file content.
            logger.warning(
                "Attachment %s could not be processed: %s",
                attachment.uuid,
                type(ex).__name__,
            )
            store.mark_failed(attachment, "This file could not be processed.")

        return self.response(201, result=_attachment_payload(attachment))

    @expose("/attachment/<int:pk>", methods=("DELETE",))
    @protect()
    @safe
    @statsd_metrics
    @transaction()
    def delete_attachment(self, pk: int) -> Response:
        """Remove an attachment and its stored bytes.
        ---
        delete:
          summary: Delete a chat attachment
          parameters:
          - in: path
            schema:
              type: integer
            name: pk
          responses:
            200:
              description: Attachment deleted
              content:
                application/json:
                  schema:
                    type: object
            404:
              $ref: '#/components/responses/404'
        """
        from zobi.agent import attachments as store  # noqa: PLC0415

        # Joined to conversations so ownership is checked in the query: an
        # attachment id alone must never be enough to delete someone's file.
        attachment = (
            db.session.query(ChatAttachment)
            .join(Conversation, ChatAttachment.conversation_id == Conversation.id)
            .filter(
                ChatAttachment.id == pk,
                Conversation.user_id == get_user_id(),
            )
            .first()
        )
        if attachment is None:
            return self.response_404()

        store.delete_attachment(attachment)
        return self.response(200, message="OK")

    @expose("/transcribe", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    def transcribe(self) -> Response:
        """Turn recorded audio into text.

        Returns 503 rather than 500 when nothing can serve the request, since
        "no transcription model is configured" is an operator action, not a
        bug, and the UI shows the message verbatim.
        ---
        post:
          summary: Transcribe recorded audio
          responses:
            200:
              description: Transcribed text
              content:
                application/json:
                  schema:
                    type: object
            400:
              $ref: '#/components/responses/400'
            503:
              description: No transcription backend is available
              content:
                application/json:
                  schema:
                    type: object
        """
        from zobi.agent.voice import (  # noqa: PLC0415
            transcribe_audio,
            TranscriptionError,
        )

        upload = request.files.get("audio")
        if upload is None:
            return self.response_400(message="No audio was supplied.")

        try:
            result = transcribe_audio(
                upload.read(),
                upload.filename or "recording.webm",
                language=request.form.get("language") or None,
            )
        except TranscriptionError as ex:
            return self.response(503, message=str(ex))

        return self.response(200, result=result)

    @expose("/transcribe/status", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    def transcribe_status(self) -> Response:
        """Report whether transcription can work, so the UI can hide the mic.

        Cheap by contract: loads no model weights and makes no network call.
        ---
        get:
          summary: Check transcription availability
          responses:
            200:
              description: Availability
              content:
                application/json:
                  schema:
                    type: object
        """
        from zobi.agent.voice import transcription_available  # noqa: PLC0415

        return self.response(200, result=transcription_available())
