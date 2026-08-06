"""Tests for chat attachment storage.

The interesting behaviour here is defensive: a filename is a label and never a
path, a content type is a claim and never a fact, and a large file is refused
before it costs any disk. Those three are what the assertions concentrate on.
"""

from __future__ import annotations

import io
from pathlib import Path
from typing import Any

import pytest
from _pytest.monkeypatch import MonkeyPatch
from flask import current_app
from sqlalchemy.orm.session import Session
from werkzeug.datastructures import FileStorage

from zobi.agent import attachments
from zobi.agent.attachments import (
    AttachmentError,
    AttachmentTooLargeError,
    delete_attachment,
    detect_kind,
    KIND_CSV,
    KIND_IMAGE,
    KIND_OTHER,
    KIND_PDF,
    KIND_SQL,
    load_bytes,
    mark_failed,
    mark_ready,
    save_upload,
    STATUS_FAILED,
    STATUS_PENDING,
    STATUS_READY,
)
from zobi.models.chat import ChatAttachment, Conversation

PNG_HEADER = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
PDF_BYTES = b"%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n"
CSV_BYTES = b"name,age,city\nalice,30,berlin\nbob,41,lisbon\n"
SQL_BYTES = b"SELECT name, age, city\nFROM users\nWHERE age > 30;\n"
SVG_BYTES = b'<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>'
#: gzip, a binary format with no attachment kind of its own.
GZIP_BYTES = b"\x1f\x8b\x08\x00\x00\x00\x00\x00"


@pytest.fixture
def storage_root(tmp_path: Path, monkeypatch: MonkeyPatch) -> Path:
    """Point attachment storage at a throwaway directory.

    ``monkeypatch.setitem`` rather than plain assignment: the ``app`` fixture
    is module scoped, so a config change would otherwise outlive the test.
    """
    root = tmp_path / "attachments"
    monkeypatch.setitem(current_app.config, "AGENT_ATTACHMENTS_FOLDER", str(root))
    return root


@pytest.fixture
def chat_tables(session: Session) -> Session:
    """Create the conversation and attachment tables in the in-memory db."""
    ChatAttachment.metadata.create_all(session.get_bind())
    return session


@pytest.fixture
def conversation(chat_tables: Session) -> Conversation:
    conversation = Conversation(user_id=1, title="attachments")
    chat_tables.add(conversation)
    chat_tables.flush()
    return conversation


class _UnseekableStream(io.RawIOBase):
    """A stream that refuses to report its length.

    Stands in for a chunked upload, where the only way to know how big the
    body is is to count it as it arrives.
    """

    def __init__(self, data: bytes) -> None:
        self._buffer = io.BytesIO(data)

    def seekable(self) -> bool:
        return False

    def readable(self) -> bool:
        return True

    def read(self, size: int = -1) -> bytes:
        return self._buffer.read(size)


def _upload(
    data: bytes,
    filename: str = "data.csv",
    content_type: str = "text/csv",
    seekable: bool = True,
) -> FileStorage:
    stream: Any = io.BytesIO(data) if seekable else _UnseekableStream(data)
    return FileStorage(stream=stream, filename=filename, content_type=content_type)


# ---------------------------------------------------------------------------
# kind detection
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "filename,content_type,head,expected",
    [
        # The whole point: the bytes decide, not the name or the MIME type.
        ("quarterly.csv", "text/csv", PDF_BYTES, KIND_PDF),
        ("chart.csv", "text/csv", PNG_HEADER, KIND_IMAGE),
        ("secret.pdf", "application/pdf", CSV_BYTES, KIND_CSV),
        ("notes.txt", "text/plain", SQL_BYTES, KIND_SQL),
        # Honest files still classify correctly.
        ("export.csv", "text/csv", CSV_BYTES, KIND_CSV),
        ("query.sql", "application/sql", SQL_BYTES, KIND_SQL),
        ("report.pdf", "application/pdf", PDF_BYTES, KIND_PDF),
        ("logo.png", "image/png", PNG_HEADER, KIND_IMAGE),
        ("photo.jpg", "image/jpeg", b"\xff\xd8\xff\xe0\x00\x10JFIF", KIND_IMAGE),
        # SVG is text, so it has to be recognised from its markup.
        ("icon.svg", "image/svg+xml", SVG_BYTES, KIND_IMAGE),
        # A binary format we do not handle is "other", never the claimed kind.
        ("book.pdf", "application/pdf", GZIP_BYTES, KIND_OTHER),
    ],
)
def test_kind_comes_from_the_content(
    filename: str, content_type: str, head: bytes, expected: str
) -> None:
    assert detect_kind(filename, content_type, head) == expected


def test_a_csv_whose_headers_are_sql_words_is_still_a_csv() -> None:
    """Keyword matching alone would misread this file.

    ``select`` opens the line, but a comma follows it rather than whitespace,
    and every row has the same three fields. That is a table.
    """
    head = b"select,from,where\n1,2,3\n4,5,6\n"

    assert detect_kind("t.csv", "text/csv", head) == KIND_CSV


def test_sql_inserts_full_of_commas_are_still_sql() -> None:
    """The mirror case: commas line up, but the file is a script."""
    head = b"INSERT INTO t VALUES (1,2,3);\nINSERT INTO t VALUES (4,5,6);\n"

    assert detect_kind("dump.csv", "text/csv", head) == KIND_SQL


def test_a_file_that_opens_with_a_sql_comment_is_sql() -> None:
    head = b"-- monthly revenue\n-- owner: analytics\nselect 1\n"

    assert detect_kind("thing.txt", "text/plain", head) == KIND_SQL


def test_the_name_only_breaks_ties_between_textual_kinds() -> None:
    """Single-column text says nothing on its own, so the name gets a vote.

    It is allowed to choose between csv and sql only. Claiming a kind that has
    an unambiguous signature would hand the client back the control that
    content sniffing just took away.
    """
    head = b"berlin\nlisbon\nmadrid\n"

    assert detect_kind("cities.csv", "text/csv", head) == KIND_CSV
    assert detect_kind("cities.sql", "application/sql", head) == KIND_SQL
    assert detect_kind("cities.pdf", "application/pdf", head) == KIND_OTHER
    assert detect_kind("cities.png", "image/png", head) == KIND_OTHER


# ---------------------------------------------------------------------------
# path safety
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "filename",
    [
        "../../etc/passwd",
        "..\\..\\windows\\system32\\config\\sam",
        "/etc/shadow",
        "....//....//etc/passwd",
        "",
    ],
)
def test_the_filename_cannot_influence_the_path(
    storage_root: Path, conversation: Conversation, filename: str
) -> None:
    """Nothing the client sends contributes to where the bytes land.

    The path is built from the conversation id and a fresh uuid, so these
    names have nowhere to escape to.
    """
    attachment = save_upload(conversation.id, _upload(CSV_BYTES, filename=filename))

    stored = Path(attachment.storage_path)
    # Inside the root, named for the uuid, and the only file anywhere near it.
    assert stored.resolve().is_relative_to(storage_root.resolve())
    assert stored.name == f"{attachment.uuid.hex}.bin"
    assert [path.name for path in storage_root.rglob("*.bin")] == [stored.name]
    assert stored.read_bytes() == CSV_BYTES


def test_the_original_filename_survives_only_as_a_label(
    storage_root: Path, conversation: Conversation
) -> None:
    """Kept for display, reduced to a basename so nobody can rejoin it."""
    attachment = save_upload(
        conversation.id, _upload(CSV_BYTES, filename="../../etc/passwd")
    )

    assert attachment.filename == "passwd"


def test_an_unusable_filename_falls_back_to_a_placeholder(
    storage_root: Path, conversation: Conversation
) -> None:
    attachment = save_upload(conversation.id, _upload(CSV_BYTES, filename="../"))

    assert attachment.filename == "attachment"


def test_a_tampered_storage_path_is_refused(
    storage_root: Path, conversation: Conversation
) -> None:
    """``storage_path`` is re-checked on read.

    This module is the only writer of that column, but a stored path is
    exactly the kind of value that becomes an arbitrary file read if anything
    ever manages to set it.
    """
    attachment = save_upload(conversation.id, _upload(CSV_BYTES))
    attachment.storage_path = "/etc/passwd"

    with pytest.raises(AttachmentError):
        load_bytes(attachment)


# ---------------------------------------------------------------------------
# size limit
# ---------------------------------------------------------------------------


def test_an_oversized_upload_never_reaches_the_disk(
    storage_root: Path, conversation: Conversation, monkeypatch: MonkeyPatch
) -> None:
    """A seekable stream can be measured before a single byte is written."""
    monkeypatch.setitem(current_app.config, "AGENT_ATTACHMENT_MAX_BYTES", 64)

    with pytest.raises(AttachmentTooLargeError):
        save_upload(conversation.id, _upload(b"x" * 65))

    assert list(storage_root.rglob("*.bin")) == []


def test_an_oversized_chunked_upload_is_cut_off_and_cleaned_up(
    storage_root: Path, conversation: Conversation, monkeypatch: MonkeyPatch
) -> None:
    """A stream with no length has to be counted as it is copied.

    The partial file is removed on the way out: leaving it would let a caller
    fill the disk with rejected uploads.
    """
    monkeypatch.setitem(current_app.config, "AGENT_ATTACHMENT_MAX_BYTES", 64)

    with pytest.raises(AttachmentTooLargeError):
        save_upload(conversation.id, _upload(b"x" * 100_000, seekable=False))

    assert list(storage_root.rglob("*.bin")) == []


def test_a_file_at_the_limit_is_accepted(
    storage_root: Path, conversation: Conversation, monkeypatch: MonkeyPatch
) -> None:
    """The limit is a ceiling, not a strict inequality."""
    monkeypatch.setitem(current_app.config, "AGENT_ATTACHMENT_MAX_BYTES", 64)

    attachment = save_upload(conversation.id, _upload(b"x" * 64))

    assert attachment.size_bytes == 64


def test_an_empty_upload_is_refused(
    storage_root: Path, conversation: Conversation
) -> None:
    with pytest.raises(AttachmentError):
        save_upload(conversation.id, _upload(b""))

    assert list(storage_root.rglob("*.bin")) == []


# ---------------------------------------------------------------------------
# status transitions
# ---------------------------------------------------------------------------


def test_a_new_upload_starts_pending(
    storage_root: Path, conversation: Conversation
) -> None:
    """Processing happens after the upload responds, so nothing is ready yet."""
    attachment = save_upload(conversation.id, _upload(CSV_BYTES, filename="rows.csv"))

    assert attachment.status == STATUS_PENDING
    assert attachment.error is None
    assert attachment.extract_dict == {}
    assert attachment.kind == KIND_CSV
    assert attachment.size_bytes == len(CSV_BYTES)
    assert attachment.message_id is None


def test_mark_ready_records_the_extraction(
    storage_root: Path, conversation: Conversation
) -> None:
    attachment = save_upload(conversation.id, _upload(CSV_BYTES))

    mark_ready(attachment, {"columns": ["name", "age", "city"], "row_count": 2})

    assert attachment.status == STATUS_READY
    assert attachment.error is None
    assert attachment.extract_dict == {
        "columns": ["name", "age", "city"],
        "row_count": 2,
    }


def test_mark_failed_records_why(
    storage_root: Path, conversation: Conversation
) -> None:
    attachment = save_upload(conversation.id, _upload(CSV_BYTES))

    mark_failed(attachment, "Could not parse row 4.")

    assert attachment.status == STATUS_FAILED
    assert attachment.error == "Could not parse row 4."


def test_a_failure_after_a_success_clears_the_ready_state(
    storage_root: Path, conversation: Conversation
) -> None:
    """Reprocessing must not leave a row that is both ready and failed."""
    attachment = save_upload(conversation.id, _upload(CSV_BYTES))
    mark_ready(attachment, {"row_count": 2})

    mark_failed(attachment, "Reprocessing failed.")

    assert attachment.status == STATUS_FAILED
    assert attachment.error == "Reprocessing failed."


def test_a_success_after_a_failure_clears_the_error(
    storage_root: Path, conversation: Conversation
) -> None:
    attachment = save_upload(conversation.id, _upload(CSV_BYTES))
    mark_failed(attachment, "Transient read error.")

    mark_ready(attachment, {"row_count": 2})

    assert attachment.status == STATUS_READY
    assert attachment.error is None


def test_a_long_error_is_truncated(
    storage_root: Path, conversation: Conversation
) -> None:
    """A processor echoing a driver traceback should not bloat the table."""
    attachment = save_upload(conversation.id, _upload(CSV_BYTES))

    mark_failed(attachment, "e" * 10_000)

    assert len(attachment.error) == attachments.MAX_ERROR_LENGTH


def test_a_malformed_extract_reads_as_empty(
    storage_root: Path, conversation: Conversation
) -> None:
    """Hand-edited or half-written JSON must not break rendering the thread."""
    attachment = save_upload(conversation.id, _upload(CSV_BYTES))
    attachment.extract = "{not json"

    assert attachment.extract_dict == {}

    # A valid JSON scalar is not a dict either, and is treated the same way.
    attachment.extract = "42"
    assert attachment.extract_dict == {}


# ---------------------------------------------------------------------------
# round trip and removal
# ---------------------------------------------------------------------------


def test_bytes_survive_the_round_trip(
    storage_root: Path, conversation: Conversation
) -> None:
    """Larger than one chunk, so the copy loop is actually exercised."""
    payload = b"id,value\n" + b"".join(b"%d,x\n" % i for i in range(50_000))
    attachment = save_upload(conversation.id, _upload(payload))

    assert load_bytes(attachment) == payload
    assert attachment.size_bytes == len(payload)


def test_delete_removes_both_the_row_and_the_file(
    storage_root: Path, chat_tables: Session, conversation: Conversation
) -> None:
    attachment = save_upload(conversation.id, _upload(CSV_BYTES))
    path = Path(attachment.storage_path)
    assert path.exists()

    delete_attachment(attachment)

    assert not path.exists()
    assert chat_tables.query(ChatAttachment).count() == 0


def test_delete_still_removes_the_row_when_the_file_is_already_gone(
    storage_root: Path, chat_tables: Session, conversation: Conversation
) -> None:
    """A missing file must not strand a broken attachment in the thread."""
    attachment = save_upload(conversation.id, _upload(CSV_BYTES))
    Path(attachment.storage_path).unlink()

    delete_attachment(attachment)

    assert chat_tables.query(ChatAttachment).count() == 0


def test_to_dict_does_not_leak_the_storage_path(
    storage_root: Path, conversation: Conversation
) -> None:
    """The browser has no use for the server's filesystem layout."""
    attachment = save_upload(conversation.id, _upload(CSV_BYTES, filename="rows.csv"))
    mark_ready(attachment, {"row_count": 2})

    payload = attachment.to_dict()

    assert "storage_path" not in payload
    assert payload["filename"] == "rows.csv"
    assert payload["kind"] == KIND_CSV
    assert payload["status"] == STATUS_READY
    assert payload["extract"] == {"row_count": 2}
