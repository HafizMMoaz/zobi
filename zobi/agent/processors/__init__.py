"""Pure extraction layer for chat attachments.

A "processor" turns raw file bytes into a small, JSON-serializable dict that
the agent can reason about (and that a storage layer can persist verbatim).
Every processor module in this package exposes the same entry point::

    def process(raw: bytes, filename: str) -> dict

The returned mapping always contains at least:

- ``kind``: one of ``csv``, ``sql``, ``pdf``, ``image``
- ``summary``: a short human/LLM readable description

plus keys specific to the kind. Anything that makes the input unusable is
reported as :class:`ProcessorError`; processors never raise anything else.

These functions are deliberately pure: no database access, no Flask routes, no
ORM, no filesystem writes. They also never log file contents, only shapes and
error types, because attachments routinely contain customer data.
"""

from __future__ import annotations

import os
from typing import Any, Callable


class ProcessorError(Exception):
    """Raised when an attachment cannot be processed.

    This is the only exception type a processor is allowed to raise. The
    message is safe to show to a user: it describes the problem, never the
    file contents.
    """


#: Extension -> processor module name (inside this package).
EXTENSION_TO_KIND: dict[str, str] = {
    ".csv": "csv",
    ".tsv": "csv",
    ".tab": "csv",
    ".sql": "sql",
    ".pdf": "pdf",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".gif": "image",
    ".webp": "image",
    ".bmp": "image",
    ".tif": "image",
    ".tiff": "image",
}

SUPPORTED_EXTENSIONS: frozenset[str] = frozenset(EXTENSION_TO_KIND)


def kind_for_filename(filename: str) -> str | None:
    """Return the processor kind for ``filename``, or ``None`` if unsupported."""
    _, extension = os.path.splitext(filename or "")
    return EXTENSION_TO_KIND.get(extension.lower())


def processor_for_filename(filename: str) -> Callable[[bytes, str], dict[str, Any]]:
    """Return the ``process`` callable that handles ``filename``.

    :raises ProcessorError: if the file type is not supported.
    """
    kind = kind_for_filename(filename)
    if kind is None:
        _, extension = os.path.splitext(filename or "")
        raise ProcessorError(
            f"Unsupported attachment type '{extension or filename}'. "
            f"Supported extensions: {', '.join(sorted(SUPPORTED_EXTENSIONS))}."
        )

    # Imported lazily: the CSV processor reaches into Zobi's upload machinery,
    # which can only be imported once the Flask app has been initialized.
    if kind == "csv":
        from zobi.agent.processors.csv_processor import process
    elif kind == "sql":
        from zobi.agent.processors.sql_processor import process
    elif kind == "pdf":
        from zobi.agent.processors.pdf_processor import process
    else:
        from zobi.agent.processors.image_processor import process

    return process


def process_attachment(raw: bytes, filename: str) -> dict[str, Any]:
    """Dispatch ``raw`` to the processor matching ``filename``'s extension.

    :raises ProcessorError: if the type is unsupported or the file unusable.
    """
    return processor_for_filename(filename)(raw, filename)


__all__ = [
    "EXTENSION_TO_KIND",
    "ProcessorError",
    "SUPPORTED_EXTENSIONS",
    "kind_for_filename",
    "process_attachment",
    "processor_for_filename",
]
