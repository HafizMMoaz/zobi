"""Extract text from a PDF attachment.

**Dependency note:** Zobi does not currently ship a PDF library. Nothing in
``pyproject.toml`` provides one (``pypdf``, ``PyPDF2``, ``pdfminer.six`` and
``pymupdf`` are all absent from the environment), and this module is not
allowed to add one. It therefore implements the full processor interface
against ``pypdf`` and raises a clear :class:`ProcessorError` explaining the
missing package when it cannot be imported. Adding ``pypdf`` to
``pyproject.toml`` is the only change needed to make it work; no code change
is required.

Bounds:

- ``MAX_PDF_BYTES``     : files above 64 MiB are rejected.
- ``MAX_PAGES_SCANNED`` : text is pulled from at most 500 pages.
- ``MAX_TEXT_CHARS``    : at most 100k characters of text are returned.
"""

from __future__ import annotations

import io
import logging
from typing import Any

from zobi.agent.processors import ProcessorError

logger = logging.getLogger(__name__)

#: Name of the package this module needs. Reported in the error message.
REQUIRED_PACKAGE = "pypdf"

MAX_PDF_BYTES = 64 * 1024 * 1024
MAX_PAGES_SCANNED = 500
MAX_TEXT_CHARS = 100_000

PDF_MAGIC = b"%PDF-"

_MISSING_DEPENDENCY_MESSAGE = (
    "PDF attachments cannot be read: the '{package}' package is not installed. "
    "Add '{package}' to the Zobi Python dependencies to enable PDF text "
    "extraction."
)


def _load_pypdf() -> Any:
    try:
        import pypdf
    except ImportError as ex:
        raise ProcessorError(
            _MISSING_DEPENDENCY_MESSAGE.format(package=REQUIRED_PACKAGE)
        ) from ex
    return pypdf


def _reject_unusable(raw: bytes) -> None:
    """Fail fast on input that is not worth handing to a PDF library."""
    if not raw:
        raise ProcessorError("This PDF file is empty.")
    if not raw[:1024].lstrip().startswith(PDF_MAGIC):
        raise ProcessorError("This file is not a PDF (missing %PDF header).")
    if len(raw) > MAX_PDF_BYTES:
        raise ProcessorError(
            f"This PDF is larger than {MAX_PDF_BYTES // (1024 * 1024)} MiB and "
            "will not be processed."
        )


def _open_reader(raw: bytes) -> tuple[Any, bool, int]:
    """Open a PDF, handling encryption, and report its page count.

    :returns: ``(reader, encrypted, page_count)``
    """
    pypdf = _load_pypdf()

    try:
        reader = pypdf.PdfReader(io.BytesIO(raw), strict=False)
    except Exception as ex:
        logger.info("Could not open attached PDF: %s", type(ex).__name__)
        raise ProcessorError(
            "This PDF file could not be read; it may be corrupt."
        ) from ex

    encrypted = bool(getattr(reader, "is_encrypted", False))
    if encrypted:
        try:
            # An empty password covers PDFs that are encrypted but not
            # password protected; anything else we decline to open.
            opened = reader.decrypt("")
        except Exception as ex:
            raise ProcessorError("This PDF is encrypted and cannot be read.") from ex
        if not opened:
            raise ProcessorError("This PDF is password protected and cannot be read.")

    try:
        page_count = len(reader.pages)
    except Exception as ex:
        raise ProcessorError(
            "This PDF file could not be read; it may be corrupt."
        ) from ex

    if page_count == 0:
        raise ProcessorError("This PDF contains no pages.")

    return reader, encrypted, page_count


def process(raw: bytes, filename: str) -> dict[str, Any]:
    """Describe a PDF attachment and extract its text.

    :returns: ``kind``, ``summary``, ``page_count``, ``pages_scanned``,
        ``text`` (capped at ``MAX_TEXT_CHARS``), ``truncated``, ``encrypted``,
        ``byte_size``.
    :raises ProcessorError: if the file is empty, not a PDF, too large,
        encrypted with a password, unreadable, or if no PDF library is
        installed.
    """
    _reject_unusable(raw)
    reader, encrypted, page_count = _open_reader(raw)

    chunks: list[str] = []
    total = 0
    pages_scanned = 0
    text_truncated = False
    for index in range(min(page_count, MAX_PAGES_SCANNED)):
        pages_scanned += 1
        try:
            page_text = reader.pages[index].extract_text() or ""
        except Exception as ex:  # a single bad page must not lose the rest
            logger.info(
                "Skipping unreadable page in attached PDF: %s", type(ex).__name__
            )
            continue
        if total + len(page_text) > MAX_TEXT_CHARS:
            chunks.append(page_text[: MAX_TEXT_CHARS - total])
            text_truncated = True
            break
        chunks.append(page_text)
        total += len(page_text)

    text = "\n\n".join(chunk for chunk in chunks if chunk)
    truncated = text_truncated or pages_scanned < page_count

    if not text.strip():
        summary = (
            f"PDF '{filename}' with {page_count} page(s), but no extractable text. "
            "It is probably a scanned document; the text would need OCR."
        )
    else:
        summary = (
            f"PDF '{filename}' with {page_count} page(s); "
            f"{len(text):,} characters of text extracted"
            f"{f' from the first {pages_scanned} page(s)' if truncated else ''}."
        )

    return {
        "kind": "pdf",
        "summary": summary,
        "page_count": page_count,
        "pages_scanned": pages_scanned,
        "text": text,
        "truncated": truncated,
        "encrypted": encrypted,
        "byte_size": len(raw),
    }
