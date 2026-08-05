"""Unit tests for the attachment processors in ``zobi.agent.processors``."""

from __future__ import annotations

import importlib.util
import io
import json

import pytest

from zobi.agent.processors import (
    ProcessorError,
    kind_for_filename,
    process_attachment,
)
from zobi.agent.processors import csv_processor, image_processor, pdf_processor
from zobi.agent.processors import sql_processor


def _json_roundtrip(payload: dict) -> dict:
    """Every processor result must survive JSON serialization."""
    return json.loads(json.dumps(payload))


# ---------------------------------------------------------------------------
# CSV
# ---------------------------------------------------------------------------


def test_csv_basic() -> None:
    raw = b"id,name,score,when\n1,alice,1.5,2024-01-01\n2,bob,2.5,2024-01-02\n"
    result = csv_processor.process(raw, "people.csv")

    assert result["kind"] == "csv"
    assert result["delimiter"] == ","
    assert result["encoding"] == "utf-8"
    assert result["has_header"] is True
    assert result["row_count"] == 2
    assert result["row_count_is_estimate"] is False
    assert result["truncated"] is False
    assert [column["name"] for column in result["columns"]] == [
        "id",
        "name",
        "score",
        "when",
    ]
    types = {column["name"]: column["type"] for column in result["columns"]}
    assert types["id"] == "integer"
    assert types["name"] == "string"
    assert types["score"] == "number"
    assert types["when"] == "datetime"
    assert len(result["preview"]) == 2
    assert result["preview"][0]["name"] == "alice"
    assert "people.csv" in result["summary"]
    _json_roundtrip(result)


def test_csv_semicolon_delimiter() -> None:
    raw = b"a;b;c\n1;2;3\n4;5;6\n7;8;9\n"
    result = csv_processor.process(raw, "semi.csv")

    assert result["delimiter"] == ";"
    assert result["row_count"] == 3
    assert len(result["columns"]) == 3


def test_csv_tab_delimiter_from_extension() -> None:
    raw = b"a\tb\n1\t2\n"
    result = csv_processor.process(raw, "data.tsv")

    assert result["delimiter"] == "\t"
    assert [column["name"] for column in result["columns"]] == ["a", "b"]


def test_csv_pipe_delimiter() -> None:
    raw = b"a|b|c\nx|y|z\np|q|r\n"
    result = csv_processor.process(raw, "piped.csv")

    assert result["delimiter"] == "|"
    assert len(result["columns"]) == 3


def test_csv_utf8_bom() -> None:
    raw = "id,city\n1,Köln\n".encode("utf-8-sig")
    result = csv_processor.process(raw, "bom.csv")

    assert result["encoding"] == "utf-8-sig"
    assert [column["name"] for column in result["columns"]] == ["id", "city"]
    assert result["preview"][0]["city"] == "Köln"


def test_csv_cp1252_encoding() -> None:
    raw = "name,city\nJosé,Köln\nJosé,Köln\n".encode("cp1252")
    result = csv_processor.process(raw, "latin.csv")

    assert result["encoding"] in {"cp1252", "latin-1"}
    assert result["row_count"] == 2
    _json_roundtrip(result)


def test_csv_utf16_with_bom() -> None:
    raw = b"\xff\xfe" + "id,name\n1,alice\n2,bob\n".encode("utf-16-le")
    result = csv_processor.process(raw, "wide.csv")

    assert result["encoding"] == "utf-16"
    assert [column["name"] for column in result["columns"]] == ["id", "name"]
    assert result["row_count"] == 2


def test_csv_quoted_field_with_newline() -> None:
    raw = b'id,note\n1,"first line\nsecond line"\n2,"plain"\n'
    result = csv_processor.process(raw, "quoted.csv")

    assert result["row_count"] == 2
    assert "\n" in result["preview"][0]["note"]


def test_csv_without_header_row() -> None:
    raw = b"1,2,3\n4,5,6\n7,8,9\n"
    result = csv_processor.process(raw, "headerless.csv")

    assert result["has_header"] is False
    assert [column["name"] for column in result["columns"]] == [
        "column_1",
        "column_2",
        "column_3",
    ]
    assert result["row_count"] == 3
    assert "no header row" in result["summary"]


def test_csv_header_only() -> None:
    result = csv_processor.process(b"a,b,c\n", "empty_body.csv")

    assert result["row_count"] == 0
    assert result["preview"] == []
    assert len(result["columns"]) == 3


def test_csv_truncates_large_file(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(csv_processor, "MAX_SCAN_BYTES", 200)
    raw = b"col_a,col_b\n" + b"1,2\n" * 5_000

    result = csv_processor.process(raw, "big.csv")

    assert result["truncated"] is True
    assert result["row_count_is_estimate"] is True
    # The estimate should be in the right ballpark, not exact.
    assert 2_000 < result["row_count"] < 10_000
    assert len(result["preview"]) <= csv_processor.PREVIEW_ROWS


def test_csv_row_cap(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(csv_processor, "MAX_ROWS_PARSED", 10)
    raw = b"a,b\n" + b"1,2\n" * 100

    result = csv_processor.process(raw, "many_rows.csv")

    assert result["row_count"] == 10
    assert result["row_count_is_estimate"] is True
    assert result["truncated"] is True


def test_csv_column_cap(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(csv_processor, "MAX_COLUMNS", 3)
    header = ",".join(f"c{index}" for index in range(10)).encode()
    row = ",".join(str(index) for index in range(10)).encode()
    raw = header + b"\n" + row + b"\n"

    result = csv_processor.process(raw, "wide.csv")

    assert len(result["columns"]) == 3
    assert result["columns_truncated"] is True


def test_csv_single_huge_line_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(csv_processor, "MAX_SCAN_BYTES", 64)
    raw = b"x" * 5_000  # no row boundary anywhere in the scan window

    with pytest.raises(ProcessorError, match="longer than"):
        csv_processor.process(raw, "oneline.csv")


def test_csv_long_cell_is_clipped_in_preview() -> None:
    raw = b"a,b\n1," + b"x" * (csv_processor.MAX_PREVIEW_CELL_CHARS + 50) + b"\n"

    result = csv_processor.process(raw, "long_cell.csv")

    assert len(result["preview"][0]["b"]) == csv_processor.MAX_PREVIEW_CELL_CHARS + 3


def test_csv_empty_file_raises() -> None:
    with pytest.raises(ProcessorError, match="empty"):
        csv_processor.process(b"", "empty.csv")
    with pytest.raises(ProcessorError, match="empty"):
        csv_processor.process(b"   \n\n", "blank.csv")


def test_csv_reuses_zobi_csv_reader(monkeypatch: pytest.MonkeyPatch) -> None:
    """The CSV processor must delegate parsing to Zobi's own uploader."""
    module = csv_processor._csv_reader_module()
    assert module is not None, "Zobi's CSVReader could not be imported"

    calls: list[dict] = []
    original = module.CSVReader._read_csv

    def spy(file, kwargs):  # type: ignore[no-untyped-def]
        calls.append(dict(kwargs))
        return original(file, kwargs)

    monkeypatch.setattr(module.CSVReader, "_read_csv", staticmethod(spy))
    result = csv_processor.process(b"a,b\n1,2\n", "reuse.csv")

    assert calls, "fell back to pandas instead of reusing CSVReader"
    assert calls[0]["sep"] == ","
    assert result["row_count"] == 1


def test_csv_falls_back_when_reader_unavailable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Outside an initialized app the pandas path must still work."""
    monkeypatch.setattr(csv_processor, "_csv_reader_module", lambda: None)

    result = csv_processor.process(b"a,b\n1,2\n3,4\n", "fallback.csv")

    assert result["row_count"] == 2
    assert [column["name"] for column in result["columns"]] == ["a", "b"]


def test_csv_ragged_rows_do_not_fail() -> None:
    raw = b"a,b\n1,2\n1,2,3,4,5\n3,4\n"

    result = csv_processor.process(raw, "ragged.csv")

    assert result["kind"] == "csv"
    assert result["row_count"] >= 2


# ---------------------------------------------------------------------------
# SQL
# ---------------------------------------------------------------------------


def test_sql_read_only_script() -> None:
    raw = b"SELECT a, b FROM sales.orders WHERE a > 1;\nSELECT * FROM customers;\n"
    result = sql_processor.process(raw, "report.sql")

    assert result["kind"] == "sql"
    assert result["statements"] == 2
    assert result["statement_types"] == {"SELECT": 2}
    assert set(result["tables_referenced"]) == {"sales.orders", "customers"}
    assert result["has_ddl"] is False
    assert result["has_dml"] is False
    assert result["is_read_only"] is True
    assert result["is_destructive"] is False
    assert result["parsed"] is True
    assert "read-only" in result["summary"]
    _json_roundtrip(result)


def test_sql_ddl_and_dml() -> None:
    raw = (
        b"CREATE TABLE staging (id INT);\n"
        b"INSERT INTO staging VALUES (1);\n"
        b"UPDATE staging SET id = 2;\n"
        b"SELECT * FROM staging;\n"
    )
    result = sql_processor.process(raw, "load.sql")

    assert result["statements"] == 4
    assert result["statement_types"]["CREATE"] == 1
    assert result["statement_types"]["INSERT"] == 1
    assert result["statement_types"]["UPDATE"] == 1
    assert result["statement_types"]["SELECT"] == 1
    assert result["has_ddl"] is True
    assert result["has_dml"] is True
    assert result["is_read_only"] is False
    assert "staging" in result["tables_referenced"]


def test_sql_destructive_statement() -> None:
    result = sql_processor.process(b"DROP TABLE customers;", "drop.sql")

    assert result["is_destructive"] is True
    assert result["has_ddl"] is True
    assert result["is_read_only"] is False
    assert "destructive" in result["summary"].lower()


def test_sql_truncate_is_destructive() -> None:
    result = sql_processor.process(b"TRUNCATE TABLE customers;", "truncate.sql")

    assert result["is_destructive"] is True
    assert result["is_read_only"] is False


def test_sql_cte_select_is_read_only() -> None:
    raw = b"WITH recent AS (SELECT * FROM orders) SELECT count(*) FROM recent;"
    result = sql_processor.process(raw, "cte.sql")

    assert result["is_read_only"] is True
    assert result["statement_types"] == {"SELECT": 1}
    assert "orders" in result["tables_referenced"]


def test_sql_unparseable_is_never_read_only() -> None:
    raw = b"SELECT FROM WHERE ((( ;;; %%% not sql at all"
    result = sql_processor.process(raw, "broken.sql")

    assert result["is_read_only"] is False
    # Either sqlglot rejected it (parsed=False) or it parsed into something
    # that is not a plain SELECT; both must be reported as not read-only.
    assert result["statements"] >= 1
    _json_roundtrip(result)


def test_sql_truncated_script_is_not_read_only(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(sql_processor, "MAX_SQL_BYTES", 64)
    raw = b"SELECT * FROM t;\n" * 100

    result = sql_processor.process(raw, "many.sql")

    assert result["truncated"] is True
    assert result["is_read_only"] is False
    assert len(result["preview"]) <= sql_processor.MAX_PREVIEW_CHARS


def test_sql_preview_is_capped(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(sql_processor, "MAX_PREVIEW_CHARS", 20)
    result = sql_processor.process(b"SELECT * FROM a_very_long_table_name;", "p.sql")

    assert len(result["preview"]) == 20
    assert result["preview_truncated"] is True


def test_sql_comments_only_raises() -> None:
    with pytest.raises(ProcessorError):
        sql_processor.process(b"-- just a comment\n", "comment.sql")


def test_sql_empty_raises() -> None:
    with pytest.raises(ProcessorError, match="empty"):
        sql_processor.process(b"", "empty.sql")


def test_sql_latin1_decoding() -> None:
    raw = "SELECT 'Köln' FROM städte;".encode("cp1252")
    result = sql_processor.process(raw, "latin.sql")

    assert result["kind"] == "sql"
    assert result["statements"] == 1


# ---------------------------------------------------------------------------
# PDF
# ---------------------------------------------------------------------------

_HAS_PYPDF = importlib.util.find_spec("pypdf") is not None

_MINIMAL_PDF = (
    b"%PDF-1.4\n"
    b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
    b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n"
    b"trailer<</Root 1 0 R>>\n"
)


def test_pdf_rejects_non_pdf_bytes() -> None:
    with pytest.raises(ProcessorError, match="not a PDF"):
        pdf_processor.process(b"hello world, definitely not a pdf", "fake.pdf")


def test_pdf_rejects_empty() -> None:
    with pytest.raises(ProcessorError, match="empty"):
        pdf_processor.process(b"", "empty.pdf")


def test_pdf_rejects_oversized(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(pdf_processor, "MAX_PDF_BYTES", 16)

    with pytest.raises(ProcessorError, match="larger than"):
        pdf_processor.process(_MINIMAL_PDF, "big.pdf")


@pytest.mark.skipif(_HAS_PYPDF, reason="pypdf is installed in this environment")
def test_pdf_reports_missing_dependency() -> None:
    with pytest.raises(ProcessorError) as excinfo:
        pdf_processor.process(_MINIMAL_PDF, "doc.pdf")

    assert "pypdf" in str(excinfo.value)


@pytest.mark.skipif(not _HAS_PYPDF, reason="pypdf is not installed")
def test_pdf_extracts_metadata() -> None:  # pragma: no cover - dependency absent
    result = pdf_processor.process(_MINIMAL_PDF, "doc.pdf")

    assert result["kind"] == "pdf"
    assert result["page_count"] == 1
    assert isinstance(result["text"], str)
    assert result["truncated"] is False
    _json_roundtrip(result)


# ---------------------------------------------------------------------------
# Image
# ---------------------------------------------------------------------------


def _png(width: int = 12, height: int = 7) -> bytes:
    from PIL import Image

    buffer = io.BytesIO()
    Image.new("RGB", (width, height), (10, 20, 30)).save(buffer, format="PNG")
    return buffer.getvalue()


def test_image_png_metadata() -> None:
    result = image_processor.process(_png(), "chart.png")

    assert result["kind"] == "image"
    assert result["width"] == 12
    assert result["height"] == 7
    assert result["format"] == "PNG"
    assert result["mode"] == "RGB"
    assert result["vision_ready"] is True
    assert "vision" in result["note"].lower()
    assert "chart.png" in result["summary"]
    _json_roundtrip(result)


def test_image_jpeg_metadata() -> None:
    from PIL import Image

    buffer = io.BytesIO()
    Image.new("RGB", (5, 9), (1, 2, 3)).save(buffer, format="JPEG")

    result = image_processor.process(buffer.getvalue(), "photo.jpg")

    assert result["format"] == "JPEG"
    assert (result["width"], result["height"]) == (5, 9)


def test_image_rejects_garbage() -> None:
    with pytest.raises(ProcessorError, match="not a readable image"):
        image_processor.process(b"\x00\x01\x02 definitely not an image", "x.png")


def test_image_rejects_empty() -> None:
    with pytest.raises(ProcessorError, match="empty"):
        image_processor.process(b"", "x.png")


def test_image_rejects_oversized_bytes(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(image_processor, "MAX_IMAGE_BYTES", 16)

    with pytest.raises(ProcessorError, match="larger than"):
        image_processor.process(_png(), "big.png")


def test_image_rejects_pixel_bomb(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(image_processor, "MAX_IMAGE_PIXELS", 10)

    with pytest.raises(ProcessorError, match="megapixels"):
        image_processor.process(_png(), "bomb.png")


def test_image_large_payload_is_flagged(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(image_processor, "VISION_PAYLOAD_HINT_BYTES", 1)

    result = image_processor.process(_png(), "big.png")

    assert result["vision_ready"] is False
    assert "downscaled" in result["note"]


# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "filename,expected",
    [
        ("a.csv", "csv"),
        ("a.TSV", "csv"),
        ("a.sql", "sql"),
        ("a.PDF", "pdf"),
        ("a.jpeg", "image"),
        ("a.exe", None),
        ("noextension", None),
    ],
)
def test_kind_for_filename(filename: str, expected: str | None) -> None:
    assert kind_for_filename(filename) == expected


def test_process_attachment_dispatches() -> None:
    result = process_attachment(b"a,b\n1,2\n", "data.csv")

    assert result["kind"] == "csv"


def test_process_attachment_rejects_unsupported() -> None:
    with pytest.raises(ProcessorError, match="Unsupported attachment type"):
        process_attachment(b"whatever", "malware.exe")


@pytest.mark.parametrize(
    "raw,filename",
    [
        (b"a,b\n1,2\n", "data.csv"),
        (b"SELECT 1;", "query.sql"),
    ],
)
def test_results_declare_kind_and_summary(raw: bytes, filename: str) -> None:
    result = process_attachment(raw, filename)

    assert isinstance(result["kind"], str)
    assert isinstance(result["summary"], str) and result["summary"]

