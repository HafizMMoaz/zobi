"""Describe a ``.sql`` attachment without executing anything.

Parsing is done with Zobi's own ``zobi.sql.parse.SQLScript`` (a sqlglot
wrapper), which already knows how to split a script into statements, extract
the tables each one touches, and classify mutations
(``is_select`` / ``is_mutating`` / ``is_destructive``). No SQL parser is
written here.

Because the content may later be executed against a real database, the safety
flags are deliberately pessimistic:

- ``is_read_only`` is ``True`` only when *every* statement parsed cleanly and
  every one of them is a ``SELECT`` that sqlglot does not consider mutating.
- If the script cannot be parsed, the module falls back to a keyword scan,
  sets ``parsed`` to ``False``, and reports ``is_read_only`` as ``False``
  regardless of what the keywords suggest.

Bounds: ``MAX_SQL_BYTES`` (2 MiB) of text is parsed, ``MAX_STATEMENTS`` (2000)
statements are classified, and ``MAX_PREVIEW_CHARS`` (4000) characters are
returned as a preview.
"""

from __future__ import annotations

import logging
import re
from collections import Counter
from typing import Any

from zobi.agent.processors import ProcessorError

logger = logging.getLogger(__name__)

#: sqlglot parsing is superlinear on pathological input, so cap the text.
MAX_SQL_BYTES = 2 * 1024 * 1024

#: Statements classified individually; the rest are counted only.
MAX_STATEMENTS = 2_000

#: Characters of the original script echoed back.
MAX_PREVIEW_CHARS = 4_000

#: Tables listed in ``tables_referenced``.
MAX_TABLES = 200

DDL_KEYWORDS = frozenset(
    {
        "CREATE",
        "DROP",
        "ALTER",
        "TRUNCATE",
        "RENAME",
        "COMMENT",
        "GRANT",
        "REVOKE",
    }
)

DML_KEYWORDS = frozenset(
    {
        "INSERT",
        "UPDATE",
        "DELETE",
        "MERGE",
        "REPLACE",
        "UPSERT",
        "COPY",
        "LOAD",
        "CALL",
    }
)

_LEADING_KEYWORD = re.compile(r"[A-Za-z_]+")
_COMMENTS = re.compile(r"/\*.*?\*/|--[^\n]*", re.DOTALL)


def _decode(raw: bytes) -> tuple[str, bool]:
    """Decode SQL text, capping length. Returns ``(text, truncated)``."""
    truncated = len(raw) > MAX_SQL_BYTES
    head = raw[:MAX_SQL_BYTES]
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            return head.decode(encoding), truncated
        except UnicodeDecodeError:
            continue
    raise ProcessorError("Could not decode this .sql file as text.")


def _leading_keyword(statement: str) -> str:
    """First bare keyword of a statement, ignoring comments and parentheses."""
    stripped = _COMMENTS.sub(" ", statement).lstrip().lstrip("(").lstrip()
    match = _LEADING_KEYWORD.match(stripped)
    return match.group(0).upper() if match else "UNKNOWN"


def _fallback_statements(text: str) -> list[str]:
    """Split on semicolons when sqlglot cannot parse the script at all.

    Crude on purpose: it is only used to *describe* an unparseable file, and
    the result is always reported with ``parsed=False``.
    """
    return [
        part.strip() for part in _COMMENTS.sub(" ", text).split(";") if part.strip()
    ]


def _classify(keyword: str, is_select: bool) -> str:
    if is_select:
        return "SELECT"
    return keyword


def process(raw: bytes, filename: str) -> dict[str, Any]:  # noqa: C901
    """Describe a SQL script attachment.

    :returns: ``kind``, ``summary``, ``statements`` (count),
        ``statement_types`` (mapping of keyword to count),
        ``tables_referenced``, ``preview``, ``has_ddl``, ``has_dml``,
        ``is_read_only``, ``is_destructive``, ``parsed``, ``parse_error``,
        ``truncated``, ``byte_size``.
    :raises ProcessorError: if the file is empty or not decodable as text.
    """
    if not raw or not raw.strip():
        raise ProcessorError("This .sql file is empty.")

    text, truncated = _decode(raw)
    if not text.strip():
        raise ProcessorError("This .sql file contains no statements.")

    preview = text[:MAX_PREVIEW_CHARS]
    preview_truncated = truncated or len(text) > MAX_PREVIEW_CHARS

    statement_types: Counter[str] = Counter()
    tables: set[str] = set()
    has_ddl = False
    has_dml = False
    is_destructive = False
    all_select = True
    parsed = True
    parse_error: str | None = None
    statements_seen = 0
    statements_classified = 0

    try:
        from zobi.sql.parse import SQLScript

        script = SQLScript(text, engine="base")
        statements = script.statements
        statements_seen = len(statements)
        for statement in statements[:MAX_STATEMENTS]:
            statements_classified += 1
            keyword = _leading_keyword(str(statement))
            select = statement.is_select()
            statement_types[_classify(keyword, select)] += 1
            if not select:
                all_select = False
            if keyword in DDL_KEYWORDS:
                has_ddl = True
            if keyword in DML_KEYWORDS:
                has_dml = True
            if statement.is_mutating() and keyword not in DDL_KEYWORDS:
                has_dml = True
            if statement.is_destructive():
                is_destructive = True
                has_ddl = True
            for table in statement.tables:
                if len(tables) < MAX_TABLES:
                    tables.add(str(table))
    except ProcessorError:
        raise
    except Exception as ex:
        # Unparseable (or an engine/import problem): describe it, but never
        # claim it is safe.
        parsed = False
        parse_error = f"{type(ex).__name__}: {ex}"[:500]
        logger.info("Could not parse attached SQL script: %s", type(ex).__name__)
        statement_types.clear()
        tables.clear()
        has_ddl = False
        has_dml = False
        all_select = False
        fallback = _fallback_statements(text)
        statements_seen = len(fallback)
        for statement in fallback[:MAX_STATEMENTS]:
            statements_classified += 1
            keyword = _leading_keyword(statement)
            statement_types[keyword] += 1
            if keyword in DDL_KEYWORDS:
                has_ddl = True
            if keyword in DML_KEYWORDS:
                has_dml = True

    if statements_seen == 0:
        raise ProcessorError("This .sql file contains no statements.")

    # Conservative: unparsed, truncated, or partially classified scripts are
    # never advertised as read-only.
    is_read_only = bool(
        parsed
        and all_select
        and not has_ddl
        and not has_dml
        and not truncated
        and statements_classified == statements_seen
    )

    type_summary = ", ".join(
        f"{count} {name}" for name, count in statement_types.most_common()
    )
    table_list = sorted(tables)
    summary_parts = [
        f"SQL script '{filename}' with {statements_seen} statement(s)"
        f"{' (' + type_summary + ')' if type_summary else ''}."
    ]
    if table_list:
        shown = ", ".join(table_list[:20])
        if len(table_list) > 20:
            shown += f", ... (+{len(table_list) - 20} more)"
        summary_parts.append(f"Tables referenced: {shown}.")
    if not parsed:
        summary_parts.append(
            "The script could not be parsed, so this description is based on a "
            "keyword scan and must not be treated as read-only."
        )
    elif is_read_only:
        summary_parts.append("All statements are SELECTs (read-only).")
    else:
        flags = []
        if has_ddl:
            flags.append("DDL")
        if has_dml:
            flags.append("DML")
        summary_parts.append(
            "Contains " + " and ".join(flags) + "; not read-only."
            if flags
            else "Not confirmed read-only."
        )
    if is_destructive:
        summary_parts.append("Includes destructive DDL (DROP/TRUNCATE/ALTER).")
    if truncated:
        summary_parts.append(
            f"Only the first {MAX_SQL_BYTES // 1024} KiB of the file were analyzed."
        )

    return {
        "kind": "sql",
        "summary": " ".join(summary_parts),
        "statements": statements_seen,
        "statement_types": dict(statement_types),
        "tables_referenced": table_list,
        "preview": preview,
        "preview_truncated": preview_truncated,
        "has_ddl": has_ddl,
        "has_dml": has_dml,
        "is_read_only": is_read_only,
        "is_destructive": is_destructive,
        "parsed": parsed,
        "parse_error": parse_error,
        "truncated": truncated,
        "byte_size": len(raw),
    }
