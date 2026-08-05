"""Storage for files attached to agent conversations.

Three rules shape this module:

1. **The client's filename never reaches the filesystem.** Paths are derived
   from the attachment's uuid, so ``../../etc/passwd`` is a label and nothing
   more. The original name is kept, stripped to its basename, purely so the UI
   has something to show.
2. **The client's content type is never believed.** ``detect_kind`` sniffs the
   leading bytes. A PDF renamed to ``report.csv`` is a PDF here, which matters
   because the kind decides which processor runs.
3. **Bytes are not logged.** An attachment can be a customer export. Log lines
   carry the uuid, the kind and the size, never the content and never the
   extracted text.

Files land under ``DATA_DIR/agent_attachments`` rather than ``UPLOAD_FOLDER``.
``UPLOAD_FOLDER`` defaults to ``zobi/static/uploads``, which sits inside the
directory Flask serves as ``/static`` - anything written there is reachable
over HTTP without passing through Zobi's authorization. ``DATA_DIR`` is
already the home for private server-side state (the metadata database, the log
file), is created on startup, and is not served.

Two knobs an operator can set in ``zobi_config.py``:

- ``AGENT_ATTACHMENT_MAX_BYTES`` - per-file ceiling, defaulting to
  :data:`DEFAULT_MAX_ATTACHMENT_BYTES` (25 MB).
- ``AGENT_ATTACHMENTS_FOLDER`` - where the bytes live, defaulting to
  ``<DATA_DIR>/agent_attachments``. Point it at a shared volume when running
  more than one web worker, otherwise a file uploaded to one worker is
  unreadable from the next.
"""

from __future__ import annotations

import csv
import io
import logging
import os
import re
import uuid as uuid_module
from pathlib import Path
from typing import Any, TYPE_CHECKING

from flask import current_app

from zobi.exceptions import ZobiException
from zobi.extensions import db
from zobi.models.chat import ChatAttachment
from zobi.utils import json

if TYPE_CHECKING:
    from werkzeug.datastructures import FileStorage

logger = logging.getLogger(__name__)

KIND_CSV = "csv"
KIND_SQL = "sql"
KIND_PDF = "pdf"
KIND_IMAGE = "image"
KIND_OTHER = "other"

KINDS = frozenset({KIND_CSV, KIND_SQL, KIND_PDF, KIND_IMAGE, KIND_OTHER})

STATUS_PENDING = "pending"
STATUS_READY = "ready"
STATUS_FAILED = "failed"

#: Per-file ceiling. Override with ``AGENT_ATTACHMENT_MAX_BYTES`` in
#: ``zobi_config.py``. Anything larger belongs in a database, not a chat
#: message: the whole file has to be read into memory to be processed, and the
#: useful part of it has to fit in a model's context window afterwards.
DEFAULT_MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024

#: How much of the file ``detect_kind`` looks at. Every signature we recognise
#: lives in the first few bytes; the rest is for the delimiter heuristics.
HEAD_BYTES = 8192

#: Fallback copy chunk when ``UPLOAD_CHUNK_SIZE`` is not configured.
DEFAULT_CHUNK_SIZE = 64 * 1024

#: Longest error message stored on a row, so a driver traceback echoed by a
#: processor cannot bloat the table.
MAX_ERROR_LENGTH = 2000

_FALLBACK_FILENAME = "attachment"

# Signatures checked against the head of the file, longest first so a prefix
# never shadows a more specific match.
_MAGIC: tuple[tuple[bytes, str], ...] = (
    (b"%PDF-", KIND_PDF),
    (b"\x89PNG\r\n\x1a\n", KIND_IMAGE),
    (b"\xff\xd8\xff", KIND_IMAGE),
    (b"GIF87a", KIND_IMAGE),
    (b"GIF89a", KIND_IMAGE),
    (b"BM", KIND_IMAGE),
    (b"II*\x00", KIND_IMAGE),
    (b"MM\x00*", KIND_IMAGE),
)

# A statement keyword followed by whitespace. The trailing ``\s`` is what keeps
# a CSV header row like ``select,from,where`` from reading as SQL.
_SQL_START = re.compile(
    r"^(SELECT|WITH|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|REPLACE"
    r"|MERGE|EXPLAIN|ANALYZE|VACUUM|GRANT|REVOKE|SET|USE|PRAGMA|SHOW"
    r"|DESCRIBE|DESC|BEGIN|COMMIT|ROLLBACK|CALL)\s",
    re.IGNORECASE,
)

_SVG_START = re.compile(r"<svg[\s>]", re.IGNORECASE)

# Control characters that have no business in a name we render.
_UNSAFE_NAME_CHARS = re.compile(r"[\x00-\x1f\x7f/\\]")


class AttachmentError(ZobiException):
    """An upload was rejected. The message is safe to show the user."""

    status = 400


class AttachmentTooLargeError(AttachmentError):
    """The upload exceeds the configured ceiling."""

    status = 413


def max_attachment_bytes() -> int:
    """The configured per-file ceiling, in bytes."""
    return int(
        current_app.config.get(
            "AGENT_ATTACHMENT_MAX_BYTES", DEFAULT_MAX_ATTACHMENT_BYTES
        )
    )


def attachment_root() -> Path:
    """The directory attachments are written under, created if missing.

    Created 0o700: the bytes are one user's private data and nothing outside
    the web process needs to read them.
    """
    configured = current_app.config.get("AGENT_ATTACHMENTS_FOLDER")
    root = (
        Path(configured)
        if configured
        else Path(current_app.config["DATA_DIR"]) / "agent_attachments"
    )
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    return root.resolve()


def detect_kind(
    filename: str | None,
    content_type: str | None,
    head_bytes: bytes,
) -> str:
    """Classify a file from its content, falling back to its name.

    The client controls both ``filename`` and ``content_type``, so neither is
    consulted until the bytes have failed to say anything. That ordering is
    the point of the function: whatever a file is *called*, a PDF is processed
    as a PDF.
    """
    for signature, kind in _MAGIC:
        if head_bytes.startswith(signature):
            return kind
    if head_bytes.startswith(b"RIFF") and head_bytes[8:12] == b"WEBP":
        return KIND_IMAGE

    text = _as_text(head_bytes)
    if text is None:
        # Binary with no signature we know. Guessing from the name here would
        # hand the client back the control we just took away.
        return KIND_OTHER

    if _SVG_START.search(text[:512]):
        return KIND_IMAGE
    if _looks_like_sql(text):
        return KIND_SQL
    if _looks_like_csv(text, truncated=len(head_bytes) >= HEAD_BYTES):
        return KIND_CSV

    # Text we could not place: a one-column CSV, a snippet, an empty file. The
    # name is only allowed to pick between the two textual kinds, never to
    # claim a kind that has an unambiguous signature.
    return _kind_from_hints(filename, content_type)


def save_upload(conversation_id: int, file_storage: FileStorage) -> ChatAttachment:
    """Validate an upload, write it to disk and record it as ``pending``.

    The row is flushed but not committed; the caller owns the transaction.
    Returns with ``status`` ``pending`` - a processor calls :func:`mark_ready`
    or :func:`mark_failed` once it has read the file.

    Raises :class:`AttachmentTooLargeError` if the file exceeds the ceiling,
    and :class:`AttachmentError` if it is empty.
    """
    limit = max_attachment_bytes()
    stream = file_storage.stream

    # Cheapest rejection first: if the stream can tell us its length, an
    # oversized upload never touches the disk.
    declared = _stream_size(stream) or file_storage.content_length or 0
    if declared > limit:
        raise AttachmentTooLargeError(
            f"Attachment is larger than the {_megabytes(limit)} MB limit."
        )

    head = stream.read(HEAD_BYTES)
    if not head:
        raise AttachmentError("Attachment is empty.")

    kind = detect_kind(file_storage.filename, file_storage.mimetype, head)

    attachment_uuid = uuid_module.uuid4()
    path = _storage_path(attachment_root(), conversation_id, attachment_uuid)
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)

    try:
        size = _write_stream(path, head, stream, limit)
    except Exception:
        path.unlink(missing_ok=True)
        raise

    attachment = ChatAttachment(
        uuid=attachment_uuid,
        conversation_id=conversation_id,
        filename=_display_filename(file_storage.filename),
        content_type=(file_storage.mimetype or None),
        size_bytes=size,
        kind=kind,
        storage_path=str(path),
        status=STATUS_PENDING,
    )
    db.session.add(attachment)
    db.session.flush()

    logger.info(
        "Stored attachment %s (kind=%s, bytes=%d) for conversation %s",
        attachment_uuid,
        kind,
        size,
        conversation_id,
    )
    return attachment


def load_bytes(attachment: ChatAttachment) -> bytes:
    """Read the stored bytes back.

    The path is re-checked against the attachment root before it is opened.
    ``storage_path`` is written by this module and should always be inside it,
    but a stored path is exactly the kind of value that turns into a file read
    primitive if anything ever manages to write to it.
    """
    path = _verified_path(attachment)
    try:
        return path.read_bytes()
    except OSError as ex:
        raise AttachmentError(
            "Attachment is no longer available.", exception=ex
        ) from ex


def mark_ready(attachment: ChatAttachment, extract: dict[str, Any]) -> ChatAttachment:
    """Record a successful extraction and its structured output."""
    attachment.status = STATUS_READY
    attachment.extract = json.dumps(extract or {})
    attachment.error = None
    db.session.flush()
    return attachment


def mark_failed(attachment: ChatAttachment, error: str) -> ChatAttachment:
    """Record a failed extraction.

    The file and the row are both kept: the UI needs to say which attachment
    failed and why, and a retry should not need a re-upload.
    """
    attachment.status = STATUS_FAILED
    attachment.error = (error or "Attachment could not be processed.")[
        :MAX_ERROR_LENGTH
    ]
    db.session.flush()
    return attachment


def attach_to_message(attachment: ChatAttachment, message_id: int) -> ChatAttachment:
    """Link an already-uploaded attachment to the message that carries it."""
    attachment.message_id = message_id
    db.session.flush()
    return attachment


def delete_attachment(attachment: ChatAttachment) -> None:
    """Remove the row and the file.

    The file goes first: a row without a file is a broken attachment the user
    can delete again, while a file without a row is invisible and never
    cleaned up.
    """
    attachment_uuid = attachment.uuid
    try:
        _verified_path(attachment).unlink(missing_ok=True)
    except (AttachmentError, OSError):
        # Already gone, or pointing somewhere it should not. Either way the
        # row should still go; leaving it would strand the conversation.
        logger.warning("Could not remove file for attachment %s", attachment_uuid)

    db.session.delete(attachment)
    db.session.flush()


# --------------------------------------------------------------------------
# internals
# --------------------------------------------------------------------------


def _storage_path(
    root: Path, conversation_id: int, attachment_uuid: uuid_module.UUID
) -> Path:
    """Where an attachment's bytes go.

    Every component is server-generated: an integer id and a uuid. Nothing the
    client sent contributes, so there is no traversal to defend against rather
    than a traversal we try to filter.
    """
    return root / str(int(conversation_id)) / f"{attachment_uuid.hex}.bin"


def _verified_path(attachment: ChatAttachment) -> Path:
    path = Path(attachment.storage_path or "")
    root = attachment_root()
    try:
        resolved = path.resolve()
        resolved.relative_to(root)
    except (OSError, ValueError) as ex:
        raise AttachmentError("Attachment is not readable.", exception=ex) from ex
    return resolved


def _write_stream(path: Path, head: bytes, stream: Any, limit: int) -> int:
    """Copy ``head`` plus the rest of ``stream`` to ``path``, capped at ``limit``.

    The cap is re-applied while copying because a chunked upload has no length
    to check up front: the only honest byte count is the one we counted.
    """
    chunk_size = int(current_app.config.get("UPLOAD_CHUNK_SIZE") or DEFAULT_CHUNK_SIZE)
    written = 0

    # O_EXCL because the name comes from a fresh uuid: if it already exists,
    # something is wrong and overwriting would be the wrong repair.
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "wb") as target:
        chunk = head
        while chunk:
            written += len(chunk)
            if written > limit:
                raise AttachmentTooLargeError(
                    f"Attachment is larger than the {_megabytes(limit)} MB limit."
                )
            target.write(chunk)
            chunk = stream.read(chunk_size)

    return written


def _stream_size(stream: Any) -> int | None:
    """The stream's length, if it can be had without consuming it."""
    try:
        if not stream.seekable():
            return None
        start = stream.tell()
        size = stream.seek(0, os.SEEK_END)
        stream.seek(start)
    except (AttributeError, OSError, ValueError):
        return None
    return max(size - start, 0)


def _display_filename(filename: str | None) -> str:
    """A name safe to store and render.

    Reduced to its basename with separators and control characters removed.
    This is a label: nothing downstream should join it onto a path, and after
    this it could not escape one anyway.
    """
    name = (filename or "").replace("\\", "/").rsplit("/", 1)[-1]
    name = _UNSAFE_NAME_CHARS.sub("", name).strip().strip(".")
    return name[:255] or _FALLBACK_FILENAME


def _as_text(head_bytes: bytes) -> str | None:
    """Decode the head as text, or ``None`` if it is binary.

    A NUL byte settles it. Beyond that a high proportion of undecodable bytes
    means we are looking at a format we do not recognise, not at prose.
    """
    if b"\x00" in head_bytes:
        return None
    try:
        return head_bytes.decode("utf-8")
    except UnicodeDecodeError:
        # Could be a truncated multi-byte character at the boundary, or could
        # be binary. Salvage it and let the ratio of losses decide.
        text = head_bytes.decode("utf-8", errors="ignore")
        if len(text) < len(head_bytes) * 0.9:
            return None
        return text


def _significant_text(text: str) -> str:
    """``text`` with a UTF-8 BOM and any leading whitespace removed."""
    return text.lstrip("\ufeff").lstrip()


def _looks_like_sql(text: str) -> bool:
    stripped = _significant_text(text)
    if not stripped:
        return False
    # A file that opens with a SQL comment is a script, whatever follows.
    if stripped.startswith("--") or stripped.startswith("/*"):
        return True
    return bool(_SQL_START.match(stripped))


def _looks_like_csv(text: str, truncated: bool = False) -> bool:
    """True when the head parses as a consistent multi-column table.

    Requiring the same field count on every row is what separates a real CSV
    from a SQL statement that merely contains commas: ``SELECT a, b, c`` over
    three lines does not line up, ``name,age`` over three lines does.
    """
    raw = text.splitlines()
    # When the head stopped mid-file the final line is a fragment, and a
    # fragment has the wrong number of fields by definition.
    if truncated and raw:
        raw = raw[:-1]
    lines = [line for line in raw if line.strip()]
    if len(lines) < 2:
        return False

    try:
        rows = list(csv.reader(io.StringIO("\n".join(lines))))
    except csv.Error:
        return False

    rows = [row for row in rows if row]
    if len(rows) < 2:
        return False

    width = len(rows[0])
    return width >= 2 and all(len(row) == width for row in rows)


def _kind_from_hints(filename: str | None, content_type: str | None) -> str:
    """Last resort: believe the client, but only about text.

    Restricted to csv and sql on purpose. Every other kind has a signature, so
    a file claiming to be one without looking like it is lying.
    """
    suffix = Path(_display_filename(filename)).suffix.lower()
    if suffix == ".csv" or (content_type or "").lower() in {"text/csv", "text/x-csv"}:
        return KIND_CSV
    if suffix == ".sql" or (content_type or "").lower() == "application/sql":
        return KIND_SQL
    return KIND_OTHER


def _megabytes(value: int) -> int:
    return max(value // (1024 * 1024), 1)
