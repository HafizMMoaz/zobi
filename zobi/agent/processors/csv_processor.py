"""Extract structure from a CSV/TSV attachment.

The heavy lifting is delegated to Zobi's existing upload machinery
(``zobi.commands.database.uploaders.csv_reader.CSVReader``) so that a file
described here parses exactly like the same file uploaded through
"Upload CSV to database". Only the things ``CSVReader`` does not do -- sniffing
the delimiter and the presence of a header row, bounding how much is read, and
turning a dataframe into an LLM-readable summary -- are implemented here.

Bounds (everything here has to survive a hostile 5 GB "CSV"):

- ``MAX_SCAN_BYTES``  : only the first 8 MiB are ever parsed.
- ``MAX_ROWS_PARSED`` : at most 250k rows are materialized as a dataframe.
- ``MAX_COLUMNS``     : at most 512 columns are described.
- A file with no row boundary inside the scan window is rejected outright.

``row_count`` is exact when the whole file fit inside those bounds, and is a
flagged estimate otherwise (see ``row_count_is_estimate``).
"""

from __future__ import annotations

import codecs
import csv
import io
import json
import logging
import os
import re
import warnings
from typing import Any

import pandas as pd

from zobi.agent.processors import ProcessorError

logger = logging.getLogger(__name__)

#: Never parse more than this much of the file. 8 MiB is far more than is
#: needed to infer a schema and is small enough that peak pandas memory stays
#: in the tens of MB even for pathological single-column files.
MAX_SCAN_BYTES = 8 * 1024 * 1024

#: Hard cap on rows handed to pandas, so a tiny-row file inside the byte cap
#: cannot build a multi-million row dataframe.
MAX_ROWS_PARSED = 250_000

#: Bytes sampled for delimiter/header/encoding sniffing.
SNIFF_BYTES = 64 * 1024

#: Columns described in the result. Wider files are truncated (and flagged).
MAX_COLUMNS = 512

#: Rows returned in ``preview``.
PREVIEW_ROWS = 5

#: Characters kept per preview cell, so one 50 MB cell cannot blow up the
#: payload that later goes into a prompt.
MAX_PREVIEW_CELL_CHARS = 500

DEFAULT_ENCODING = "utf-8"

#: Mirrors ``csv_reader.ENCODING_FALLBACKS``; kept local so the module works
#: even when the uploader package cannot be imported (see ``_csv_reader``).
ENCODING_FALLBACKS = ["utf-8", "cp1252", "latin-1"]

DELIMITER_CANDIDATES = [",", ";", "\t", "|"]

_INTEGER_LIKE = re.compile(r"^[+-]?\d+$")


def _csv_reader_module() -> Any | None:
    """Return Zobi's uploader ``csv_reader`` module, or ``None``.

    The module imports the ORM layer transitively, which raises unless the
    Flask app has been initialized. Processors must stay usable regardless, so
    the import is lazy and failure just means "use plain pandas".
    """
    try:
        from zobi.commands.database.uploaders import csv_reader
    except Exception as ex:  # pragma: no cover - depends on app bootstrap
        logger.debug("Zobi CSVReader unavailable (%s); using pandas", type(ex).__name__)
        return None
    return csv_reader


def _detect_encoding(sample: bytes) -> str:
    """Detect the text encoding of ``sample``, BOM first."""
    for bom, encoding in (
        (codecs.BOM_UTF32_LE, "utf-32"),
        (codecs.BOM_UTF32_BE, "utf-32"),
        (codecs.BOM_UTF8, "utf-8-sig"),
        (codecs.BOM_UTF16_LE, "utf-16"),
        (codecs.BOM_UTF16_BE, "utf-16"),
    ):
        if sample.startswith(bom):
            return encoding

    # BOM-less UTF-16 decodes cleanly as latin-1 (garbage), so look for the
    # interleaved NULs that give it away before falling back.
    if b"\x00" in sample[:4096]:
        for encoding in ("utf-16-le", "utf-16-be"):
            try:
                sample[: (len(sample) // 2) * 2].decode(encoding)
            except UnicodeDecodeError:
                continue
            return encoding

    for encoding in ENCODING_FALLBACKS:
        try:
            sample.decode(encoding)
        except UnicodeDecodeError:
            continue
        return encoding

    return DEFAULT_ENCODING


def _decode_sample(sample: bytes, encoding: str) -> str:
    """Decode a sniffing sample, tolerating a cut multi-byte character."""
    return sample.decode(encoding, errors="replace")


def _sniff_delimiter(sample_text: str, filename: str) -> str:
    """Guess the field delimiter from a text sample."""
    if os.path.splitext(filename or "")[1].lower() in {".tsv", ".tab"}:
        return "\t"

    try:
        dialect = csv.Sniffer().sniff(sample_text, delimiters="".join(DELIMITER_CANDIDATES))
    except csv.Error:
        pass
    else:
        if dialect.delimiter in DELIMITER_CANDIDATES:
            return dialect.delimiter

    # Fallback: pick the candidate that yields the most consistent, >1 field
    # count across the first lines.
    best_delimiter, best_score = ",", (0, 0)
    for candidate in DELIMITER_CANDIDATES:
        try:
            rows = list(csv.reader(io.StringIO(sample_text), delimiter=candidate))
        except csv.Error:
            continue
        widths = [len(row) for row in rows[:20] if row]
        if not widths:
            continue
        modal_width = max(set(widths), key=widths.count)
        if modal_width < 2:
            continue
        score = (widths.count(modal_width), modal_width)
        if score > best_score:
            best_delimiter, best_score = candidate, score

    return best_delimiter


def _sniff_header(sample_text: str, delimiter: str) -> bool:
    """Guess whether the first row holds column names."""
    try:
        rows = list(csv.reader(io.StringIO(sample_text), delimiter=delimiter))
    except csv.Error:
        rows = []
    rows = [row for row in rows[:2] if row]
    if not rows:
        return True

    def _looks_numeric(value: str) -> bool:
        value = value.strip()
        if not value:
            return False
        try:
            float(value)
        except ValueError:
            return False
        return True

    first = rows[0]
    # A numeric cell in the first row is strong evidence there is no header.
    if any(_looks_numeric(cell) for cell in first):
        return False
    if len(rows) < 2:
        # All-text single row: a header is the conventional reading.
        return True
    # First row all text; treat it as a header if the second row differs in
    # shape (any numeric cell) or if headers are unique non-empty labels.
    if any(_looks_numeric(cell) for cell in rows[1]):
        return True
    labels = [cell.strip() for cell in first]
    return all(labels) and len(set(labels)) == len(labels)


def _truncate_at_row_boundary(raw: bytes, encoding: str) -> tuple[bytes, bool]:
    """Return ``(scannable_bytes, was_truncated)`` cut on a line boundary."""
    if len(raw) <= MAX_SCAN_BYTES:
        return raw, False

    newline = b"\n"
    if encoding.startswith("utf-16") or encoding.startswith("utf-32"):
        # Multi-byte encodings: cut on a code-unit-aligned newline instead.
        width = 4 if encoding.startswith("utf-32") else 2
        head = raw[: MAX_SCAN_BYTES - (MAX_SCAN_BYTES % width)]
        return head, True

    head = raw[:MAX_SCAN_BYTES]
    cut = head.rfind(newline)
    if cut == -1:
        raise ProcessorError(
            "The first line of this CSV is longer than "
            f"{MAX_SCAN_BYTES // (1024 * 1024)} MiB; the file does not look "
            "like delimited text."
        )
    return head[: cut + 1], True


def _read_kwargs(encoding: str, delimiter: str, has_header: bool) -> dict[str, Any]:
    return {
        "sep": delimiter,
        "encoding": encoding,
        "header": 0 if has_header else None,
        "nrows": MAX_ROWS_PARSED,
        "skip_blank_lines": True,
        "on_bad_lines": "skip",
        "low_memory": False,
    }


def _read_dataframe(
    data: bytes,
    filename: str,
    encoding: str,
    delimiter: str,
    has_header: bool,
) -> pd.DataFrame:
    """Parse ``data`` with Zobi's ``CSVReader`` when possible, else pandas."""
    kwargs = _read_kwargs(encoding, delimiter, has_header)

    module = _csv_reader_module()
    if module is not None:
        from werkzeug.datastructures import FileStorage

        storage = FileStorage(stream=io.BytesIO(data), filename=filename)
        try:
            return module.CSVReader._read_csv(storage, dict(kwargs))
        except Exception as ex:
            # ``_read_csv`` needs an app context (feature flags). Outside one it
            # raises RuntimeError, in which case the plain pandas path below is
            # equivalent; a genuine parse failure is re-raised there too.
            logger.debug("CSVReader read failed (%s); using pandas", type(ex).__name__)

    try:
        return pd.read_csv(io.BytesIO(data), **kwargs)
    except UnicodeDecodeError:
        for fallback in ENCODING_FALLBACKS:
            if fallback == encoding:
                continue
            try:
                return pd.read_csv(
                    io.BytesIO(data), **{**kwargs, "encoding": fallback}
                )
            except (UnicodeDecodeError, ValueError, pd.errors.ParserError):
                continue
        raise ProcessorError("Could not decode this CSV with any known encoding.")
    except pd.errors.EmptyDataError as ex:
        raise ProcessorError("This CSV file contains no data.") from ex
    except (ValueError, pd.errors.ParserError) as ex:
        raise ProcessorError(f"Could not parse this CSV: {ex}") from ex
    except Exception as ex:
        raise ProcessorError("Could not read this CSV file.") from ex


def _infer_type(series: pd.Series) -> str:
    """Map a pandas column to a coarse, LLM-friendly type name."""
    dtype = series.dtype
    if pd.api.types.is_bool_dtype(dtype):
        return "boolean"
    if pd.api.types.is_integer_dtype(dtype):
        return "integer"
    if pd.api.types.is_float_dtype(dtype):
        return "number"
    if pd.api.types.is_datetime64_any_dtype(dtype):
        return "datetime"

    values = series.dropna()
    if values.empty:
        return "string"

    sample = values.head(200).astype(str)
    if sample.map(lambda value: bool(_INTEGER_LIKE.match(value.strip()))).all():
        # Digit strings (zip codes, ids) are not dates; say so explicitly.
        return "string"

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            parsed = pd.to_datetime(sample, errors="coerce")
    except Exception:  # pragma: no cover - defensive, to_datetime is noisy
        return "string"
    if parsed.notna().mean() >= 0.9:
        return "datetime"
    return "string"


def _describe_columns(df: pd.DataFrame) -> tuple[list[dict[str, str]], bool]:
    columns = []
    truncated = len(df.columns) > MAX_COLUMNS
    for name in list(df.columns)[:MAX_COLUMNS]:
        columns.append({"name": str(name), "type": _infer_type(df[name])})
    return columns, truncated


def _build_preview(df: pd.DataFrame) -> list[dict[str, Any]]:
    """Return the first rows as JSON-safe dicts."""
    head = df.head(PREVIEW_ROWS)
    try:
        records = json.loads(head.to_json(orient="records", date_format="iso"))
    except (ValueError, TypeError):  # pragma: no cover - duplicate/odd columns
        records = [
            {str(key): (None if pd.isna(value) else str(value)) for key, value in row.items()}
            for row in head.to_dict(orient="records")
        ]

    for record in records:
        for key, value in record.items():
            if isinstance(value, str) and len(value) > MAX_PREVIEW_CELL_CHARS:
                record[key] = value[:MAX_PREVIEW_CELL_CHARS] + "..."
    return records


def _summarize(
    filename: str,
    columns: list[dict[str, str]],
    columns_truncated: bool,
    row_count: int,
    row_count_is_estimate: bool,
    delimiter: str,
    encoding: str,
    has_header: bool,
) -> str:
    shown = ", ".join(f"{column['name']} ({column['type']})" for column in columns[:20])
    if len(columns) > 20:
        shown += f", ... (+{len(columns) - 20} more)"
    rows = f"~{row_count:,} rows (estimated)" if row_count_is_estimate else f"{row_count:,} rows"
    parts = [
        f"CSV file '{filename}' with {len(columns)}"
        f"{'+' if columns_truncated else ''} columns and {rows}.",
        f"Columns: {shown}.",
        f"Delimiter {delimiter!r}, encoding {encoding}"
        f"{'' if has_header else ', no header row (columns auto-named)'}.",
    ]
    return " ".join(parts)


def process(raw: bytes, filename: str) -> dict[str, Any]:
    """Describe a CSV attachment.

    :returns: ``kind``, ``summary``, ``columns`` (``name``/``type``),
        ``row_count``, ``row_count_is_estimate``, ``preview``, ``delimiter``,
        ``encoding``, ``has_header``, ``truncated``, ``byte_size``,
        ``columns_truncated``.
    :raises ProcessorError: if the file is empty or cannot be parsed as CSV.
    """
    if not raw or not raw.strip():
        raise ProcessorError("This CSV file is empty.")

    sample = raw[:SNIFF_BYTES]
    encoding = _detect_encoding(sample)
    sample_text = _decode_sample(sample, encoding)
    # Drop a partial trailing line so sniffing never sees half a row.
    if "\n" in sample_text and len(raw) > SNIFF_BYTES:
        sample_text = sample_text[: sample_text.rfind("\n") + 1]

    delimiter = _sniff_delimiter(sample_text, filename)
    has_header = _sniff_header(sample_text, delimiter)

    scan, truncated = _truncate_at_row_boundary(raw, encoding)
    df = _read_dataframe(scan, filename, encoding, delimiter, has_header)

    if truncated and len(df) > 1:
        # The final row of a byte-truncated scan may be a partial record (for
        # example, a cut inside a quoted field), so drop it.
        df = df.iloc[:-1]

    if df.empty and not df.columns.size:
        raise ProcessorError("This CSV file contains no readable rows or columns.")

    if not has_header:
        df.columns = [f"column_{index + 1}" for index in range(len(df.columns))]

    parsed_rows = int(len(df))
    row_capped = parsed_rows >= MAX_ROWS_PARSED
    row_count = parsed_rows
    row_count_is_estimate = False
    if truncated and len(scan) and not row_capped:
        row_count = int(round(parsed_rows * (len(raw) / len(scan))))
        row_count_is_estimate = True
    elif row_capped:
        row_count_is_estimate = True

    columns, columns_truncated = _describe_columns(df)

    return {
        "kind": "csv",
        "summary": _summarize(
            filename,
            columns,
            columns_truncated,
            row_count,
            row_count_is_estimate,
            delimiter,
            encoding,
            has_header,
        ),
        "columns": columns,
        "columns_truncated": columns_truncated,
        "row_count": row_count,
        "row_count_is_estimate": row_count_is_estimate,
        "preview": _build_preview(df),
        "delimiter": delimiter,
        "encoding": encoding,
        "has_header": has_header,
        "truncated": truncated or row_capped,
        "byte_size": len(raw),
    }
