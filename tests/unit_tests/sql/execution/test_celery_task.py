
"""Tests for celery_task.py - async SQL execution via Celery."""

from typing import Any
from unittest.mock import MagicMock

import msgpack
import pytest
from celery.exceptions import SoftTimeLimitExceeded
from flask import current_app
from pytest_mock import MockerFixture

from zobi.common.db_query_status import QueryStatus as QueryStatusEnum
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType
from zobi.exceptions import ZobiErrorException, ZobiErrorsException

# Note: mock_query, mock_database, mock_result_set, and mock_db_session
# fixtures are imported from conftest.py


# =============================================================================
# Query Retrieval Tests
# =============================================================================


def test_get_query_success(
    mocker: MockerFixture, app_context: None, mock_query: MagicMock
) -> None:
    """Test successful query retrieval."""
    from zobi.sql.execution.celery_task import _get_query

    mock_session = mocker.patch("zobi.sql.execution.celery_task.db.session")
    mock_session.query.return_value.filter_by.return_value.one.return_value = mock_query

    result = _get_query(123)

    assert result == mock_query


# =============================================================================
# Error Handling Tests
# =============================================================================


def test_handle_query_error_basic(
    mocker: MockerFixture, app_context: None, mock_query: MagicMock
) -> None:
    """Test basic error handling."""
    from zobi.sql.execution.celery_task import _handle_query_error

    mocker.patch("zobi.sql.execution.celery_task.db.session")

    ex = Exception("Something went wrong")
    payload = _handle_query_error(ex, mock_query)

    assert payload["status"] == QueryStatusEnum.FAILED
    assert "Something went wrong" in payload["error"]


def test_handle_query_error_with_end_time_set(
    mocker: MockerFixture, app_context: None, mock_query: MagicMock
) -> None:
    """Test error handling when end_time is already set (line 116->120)."""
    from zobi.sql.execution.celery_task import _handle_query_error

    mocker.patch("zobi.sql.execution.celery_task.db.session")

    # Set end_time to trigger the branch skip
    mock_query.end_time = 12345.0

    ex = Exception("Error with end_time set")
    payload = _handle_query_error(ex, mock_query)

    assert payload["status"] == QueryStatusEnum.FAILED
    # end_time should not be modified
    assert mock_query.end_time == 12345.0


def test_handle_query_error_sets_end_time(
    mocker: MockerFixture, app_context: None, mock_query: MagicMock
) -> None:
    """Test error handling sets end_time when not set."""
    from zobi.sql.execution.celery_task import _handle_query_error

    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch(
        "zobi.sql.execution.celery_task.now_as_float", return_value=99999.0
    )

    # end_time is None
    mock_query.end_time = None

    ex = Exception("Error")
    _handle_query_error(ex, mock_query)

    # Should set end_time
    assert mock_query.end_time == 99999.0


def test_handle_query_error_zobi_error_exception(
    mocker: MockerFixture, app_context: None, mock_query: MagicMock
) -> None:
    """Test error handling with ZobiErrorException."""
    from zobi.sql.execution.celery_task import _handle_query_error

    mocker.patch("zobi.sql.execution.celery_task.db.session")

    error = ZobiError(
        message="Test error",
        error_type=ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
        level=ErrorLevel.ERROR,
    )
    ex = ZobiErrorException(error)

    payload = _handle_query_error(ex, mock_query)

    assert len(payload["errors"]) == 1
    assert payload["errors"][0]["message"] == "Test error"


def test_handle_query_error_zobi_errors_exception(
    mocker: MockerFixture, app_context: None, mock_query: MagicMock
) -> None:
    """Test error handling with ZobiErrorsException."""
    from zobi.sql.execution.celery_task import _handle_query_error

    mocker.patch("zobi.sql.execution.celery_task.db.session")

    errors = [
        ZobiError(
            message="Error 1",
            error_type=ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
            level=ErrorLevel.ERROR,
        ),
        ZobiError(
            message="Error 2",
            error_type=ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
            level=ErrorLevel.ERROR,
        ),
    ]
    ex = ZobiErrorsException(errors)

    payload = _handle_query_error(ex, mock_query)

    assert len(payload["errors"]) == 2


def test_handle_query_error_with_troubleshooting_link(
    mocker: MockerFixture, app_context: None, mock_query: MagicMock
) -> None:
    """Test error handling includes troubleshooting link."""
    from zobi.sql.execution.celery_task import _handle_query_error

    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch.dict(
        current_app.config, {"TROUBLESHOOTING_LINK": "https://help.example.com"}
    )

    ex = Exception("Error")
    payload = _handle_query_error(ex, mock_query)

    assert payload["link"] == "https://help.example.com"


# =============================================================================
# Serialization Tests
# =============================================================================


def test_serialize_payload_json(mocker: MockerFixture, app_context: None) -> None:
    """Test JSON serialization when msgpack config is False."""
    from zobi.sql.execution.celery_task import _serialize_payload

    mocker.patch("zobi.results_backend_use_msgpack", False)
    payload = {"status": "success", "data": [1, 2, 3]}

    result = _serialize_payload(payload)

    # Now always returns bytes (encoded UTF-8)
    assert isinstance(result, bytes)
    assert b"success" in result


def test_serialize_payload_msgpack(mocker: MockerFixture, app_context: None) -> None:
    """Test msgpack serialization when msgpack config is True."""
    from zobi.sql.execution.celery_task import _serialize_payload

    mocker.patch("zobi.results_backend_use_msgpack", True)
    payload = {"status": "success", "data": [1, 2, 3]}

    result = _serialize_payload(payload)

    assert isinstance(result, bytes)
    unpacked = msgpack.loads(result)
    assert unpacked["status"] == "success"


# =============================================================================
# Statement Preparation Tests
# =============================================================================


def test_prepare_statement_blocks_single_statement(
    app_context: None, mock_database: MagicMock
) -> None:
    """Test statement block preparation for single statement."""
    from zobi.sql.execution.celery_task import _prepare_statement_blocks

    sql = "SELECT * FROM users"

    script, blocks = _prepare_statement_blocks(sql, mock_database.db_engine_spec)

    assert len(blocks) == 1


def test_prepare_statement_blocks_multiple_statements(
    app_context: None, mock_database: MagicMock
) -> None:
    """Test statement block preparation for multiple statements."""
    from zobi.sql.execution.celery_task import _prepare_statement_blocks

    sql = "SELECT * FROM users; SELECT * FROM orders;"

    script, blocks = _prepare_statement_blocks(sql, mock_database.db_engine_spec)

    assert len(blocks) == 2


def test_prepare_statement_blocks_run_as_one(
    app_context: None, mock_database: MagicMock
) -> None:
    """Test statement block preparation when engine runs multiple as one."""
    from zobi.sql.execution.celery_task import _prepare_statement_blocks

    mock_database.db_engine_spec.run_multiple_statements_as_one = True
    sql = "SELECT * FROM users; SELECT * FROM orders;"

    script, blocks = _prepare_statement_blocks(sql, mock_database.db_engine_spec)

    assert len(blocks) == 1


# =============================================================================
# Result Finalization Tests
# =============================================================================


def test_finalize_successful_query(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_result_set: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test successful query finalization."""
    from zobi.sql.execution.celery_task import _finalize_successful_query
    from zobi.sql.parse import SQLScript

    mocker.patch("zobi.results_backend_use_msgpack", False)
    mocker.patch("zobi.dataframe.df_to_records", return_value=[{"id": 1}])
    payload: dict[str, Any] = {}

    # Create original script
    original_script = SQLScript(
        "SELECT * FROM users", mock_database.db_engine_spec.engine
    )

    # New signature: (query, original_script, execution_results, payload,
    # total_execution_time_ms). execution_results is a list of tuples:
    # (executed_sql, result_set, exec_time, rowcount)
    execution_results = [
        ("SELECT * FROM users WHERE rls_filter", mock_result_set, 10.5, 2)
    ]
    _finalize_successful_query(
        mock_query,
        original_script,
        execution_results,  # type: ignore[arg-type]
        payload,
        10.5,
    )

    assert mock_query.rows == 2
    assert mock_query.progress == 100
    assert payload["status"] == QueryStatusEnum.SUCCESS
    assert "statements" in payload
    # SQL is formatted by SQLScript, so we can't compare exact whitespace
    assert "SELECT" in payload["statements"][0]["original_sql"]
    assert "FROM users" in payload["statements"][0]["original_sql"]
    assert (
        payload["statements"][0]["executed_sql"]
        == "SELECT * FROM users WHERE rls_filter"
    )


def test_finalize_successful_query_with_msgpack(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_result_set: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test successful query finalization with Arrow/msgpack."""
    from zobi.sql.execution.celery_task import _finalize_successful_query
    from zobi.sql.parse import SQLScript

    mocker.patch("zobi.results_backend_use_msgpack", True)
    mock_buffer = MagicMock()
    mock_buffer.to_pybytes.return_value = b"arrow_data"
    mocker.patch(
        "zobi.sql.execution.celery_task.write_ipc_buffer", return_value=mock_buffer
    )

    # Mock stats_logger to cover the stats timing branch
    mock_stats = MagicMock()
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": mock_stats})

    payload: dict[str, Any] = {}

    # Create original script
    original_script = SQLScript(
        "SELECT * FROM users", mock_database.db_engine_spec.engine
    )

    execution_results = [
        ("SELECT * FROM users WHERE rls_filter", mock_result_set, 10.5, 2)
    ]
    _finalize_successful_query(
        mock_query,
        original_script,
        execution_results,  # type: ignore[arg-type]
        payload,
        10.5,
    )

    assert payload["statements"][0]["data"] == b"arrow_data"


def test_finalize_successful_query_msgpack_no_stats(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_result_set: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test finalization with msgpack when has_app_context() is False."""
    from zobi.sql.execution.celery_task import _finalize_successful_query
    from zobi.sql.parse import SQLScript

    mocker.patch("zobi.results_backend_use_msgpack", True)
    mocker.patch(
        "zobi.sql.execution.celery_task.has_app_context", return_value=False
    )
    mock_buffer = MagicMock()
    mock_buffer.to_pybytes.return_value = b"arrow_data"
    mocker.patch(
        "zobi.sql.execution.celery_task.write_ipc_buffer", return_value=mock_buffer
    )

    payload: dict[str, Any] = {}

    # Create original script
    original_script = SQLScript(
        "SELECT * FROM users", mock_database.db_engine_spec.engine
    )

    execution_results = [
        ("SELECT * FROM users WHERE rls_filter", mock_result_set, 10.5, 2)
    ]
    _finalize_successful_query(
        mock_query,
        original_script,
        execution_results,  # type: ignore[arg-type]
        payload,
        10.5,
    )

    assert payload["statements"][0]["data"] == b"arrow_data"


def test_finalize_successful_query_with_dml(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test successful query finalization with DML statement (no result_set)."""
    from zobi.sql.execution.celery_task import _finalize_successful_query
    from zobi.sql.parse import SQLScript

    payload: dict[str, Any] = {}

    # Create original script
    original_script = SQLScript(
        "INSERT INTO users VALUES (1)", mock_database.db_engine_spec.engine
    )

    # DML statement: result_set is None, rowcount indicates affected rows
    execution_results: list[tuple[str, None, float, int]] = [
        ("INSERT INTO users VALUES (1)", None, 5.0, 1)
    ]
    _finalize_successful_query(
        mock_query,
        original_script,
        execution_results,  # type: ignore[arg-type]
        payload,
        5.0,
    )

    assert mock_query.rows == 0  # No rows returned for DML
    assert mock_query.progress == 100
    assert payload["status"] == QueryStatusEnum.SUCCESS
    assert payload["statements"][0]["data"] is None
    assert payload["statements"][0]["row_count"] == 1
    assert payload["statements"][0]["columns"] == []


# =============================================================================
# Results Storage Tests
# =============================================================================


def test_store_results_in_backend_success(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test successful results storage."""
    from zobi.sql.execution.celery_task import _store_results_in_backend

    mock_results_backend = MagicMock()
    mock_results_backend.set.return_value = True
    mocker.patch(
        "zobi.sql.execution.celery_task.results_backend", mock_results_backend
    )
    mocker.patch("zobi.results_backend_use_msgpack", False)
    mocker.patch(
        "zobi.sql.execution.celery_task.zlib_compress", return_value=b"compressed"
    )
    mocker.patch("zobi.sql.execution.celery_task.db.session")

    payload = {"status": "success", "data": [], "query": {}}
    _store_results_in_backend(mock_query, payload, mock_database)

    assert mock_query.results_key is not None
    mock_results_backend.set.assert_called_once()


def test_store_results_in_backend_with_size_check(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test results storage with payload size check (covers lines 232-247)."""
    from zobi.sql.execution.celery_task import _store_results_in_backend

    mock_results_backend = MagicMock()
    mock_results_backend.set.return_value = True
    mocker.patch(
        "zobi.sql.execution.celery_task.results_backend", mock_results_backend
    )
    mocker.patch("zobi.results_backend_use_msgpack", False)
    mocker.patch(
        "zobi.sql.execution.celery_task.zlib_compress", return_value=b"compressed"
    )
    mocker.patch("zobi.sql.execution.celery_task.db.session")

    # Set a high payload max to pass the size check
    mocker.patch.dict(current_app.config, {"SQLLAB_PAYLOAD_MAX_MB": 100})

    payload = {"status": "success", "data": [], "query": {}}
    _store_results_in_backend(mock_query, payload, mock_database)

    mock_results_backend.set.assert_called_once()


def test_store_results_in_backend_payload_too_large(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test results storage with payload exceeding size limit."""
    from zobi.sql.execution.celery_task import _store_results_in_backend

    mocker.patch("zobi.results_backend_use_msgpack", False)
    # Set very low limit
    mocker.patch.dict(current_app.config, {"SQLLAB_PAYLOAD_MAX_MB": 0.000001})

    large_payload = {"data": "x" * 1000, "query": {}}

    with pytest.raises(ZobiErrorException) as exc_info:
        _store_results_in_backend(mock_query, large_payload, mock_database)

    assert exc_info.value.error.error_type == ZobiErrorType.RESULT_TOO_LARGE_ERROR


def test_store_results_in_backend_default_cache_timeout(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test storage uses default cache timeout when database timeout is None."""
    from zobi.sql.execution.celery_task import _store_results_in_backend

    mock_results_backend = MagicMock()
    mock_results_backend.set.return_value = True
    mocker.patch(
        "zobi.sql.execution.celery_task.results_backend", mock_results_backend
    )
    mocker.patch("zobi.results_backend_use_msgpack", False)
    mocker.patch(
        "zobi.sql.execution.celery_task.zlib_compress", return_value=b"compressed"
    )
    mocker.patch("zobi.sql.execution.celery_task.db.session")

    # Set database cache_timeout to None
    mock_database.cache_timeout = None

    payload = {"status": "success", "data": [], "query": {}}
    _store_results_in_backend(mock_query, payload, mock_database)

    mock_results_backend.set.assert_called_once()


def test_store_results_in_backend_write_failure(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test results storage write failure."""
    from zobi.sql.execution.celery_task import _store_results_in_backend

    mock_results_backend = MagicMock()
    mock_results_backend.set.return_value = False
    mocker.patch(
        "zobi.sql.execution.celery_task.results_backend", mock_results_backend
    )
    mocker.patch("zobi.results_backend_use_msgpack", False)
    mocker.patch(
        "zobi.sql.execution.celery_task.zlib_compress", return_value=b"compressed"
    )
    mocker.patch("zobi.sql.execution.celery_task.db.session")

    payload = {"status": "success", "data": [], "query": {}}

    with pytest.raises(ZobiErrorException) as exc_info:
        _store_results_in_backend(mock_query, payload, mock_database)

    assert exc_info.value.error.error_type == ZobiErrorType.RESULTS_BACKEND_ERROR


# =============================================================================
# Data Serialization Tests
# =============================================================================


def test_serialize_result_set_msgpack(
    mocker: MockerFixture, app_context: None, mock_result_set: MagicMock
) -> None:
    """Test result set serialization with msgpack/Arrow when config is True."""
    from zobi.sql.execution.celery_task import _serialize_result_set

    mocker.patch("zobi.results_backend_use_msgpack", True)
    mock_buffer = MagicMock()
    mock_buffer.to_pybytes.return_value = b"arrow_data"
    mocker.patch(
        "zobi.sql.execution.celery_task.write_ipc_buffer", return_value=mock_buffer
    )
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": MagicMock()})

    data, columns = _serialize_result_set(mock_result_set)

    assert data == b"arrow_data"
    assert columns == mock_result_set.columns


def test_serialize_result_set_json(
    mocker: MockerFixture, app_context: None, mock_result_set: MagicMock
) -> None:
    """Test result set serialization with JSON when msgpack config is False."""
    from zobi.sql.execution.celery_task import _serialize_result_set

    mocker.patch("zobi.results_backend_use_msgpack", False)
    mocker.patch(
        "zobi.dataframe.df_to_records",
        return_value=[{"id": 1, "name": "Alice"}],
    )

    data, columns = _serialize_result_set(mock_result_set)

    assert data == [{"id": 1, "name": "Alice"}]
    assert columns == mock_result_set.columns


# =============================================================================
# Helper Function Tests
# =============================================================================


@pytest.mark.parametrize(
    "query_status,expected_result",
    [
        (QueryStatusEnum.STOPPED, True),
        (QueryStatusEnum.RUNNING, False),
    ],
)
def test_make_check_stopped_fn(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    query_status: QueryStatusEnum,
    expected_result: bool,
) -> None:
    """Test check_stopped function returns correct value based on query status."""
    from zobi.sql.execution.celery_task import _make_check_stopped_fn

    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mock_query.status = query_status

    check_stopped = _make_check_stopped_fn(mock_query)
    result = check_stopped()

    assert result is expected_result


def test_make_execute_fn(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test execute function creation."""
    from zobi.sql.execution.celery_task import _make_execute_fn

    mock_cursor = MagicMock()
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": MagicMock()})

    execute_fn = _make_execute_fn(mock_query, mock_database.db_engine_spec)
    execute_fn(mock_cursor, "SELECT * FROM users")

    assert mock_query.executed_sql == "SELECT * FROM users"


@pytest.mark.parametrize(
    "logger_configured,should_be_called",
    [
        (True, True),
        (False, False),
    ],
    ids=["with_logger", "no_logger"],
)
def test_make_log_query_fn(
    mocker: MockerFixture,
    app_context: None,
    mock_database: MagicMock,
    logger_configured: bool,
    should_be_called: bool,
) -> None:
    """Test log query function with and without logger configured."""
    from zobi.sql.execution.celery_task import _make_log_query_fn

    mock_logger = MagicMock() if logger_configured else None
    mocker.patch.dict(current_app.config, {"QUERY_LOGGER": mock_logger})
    mocker.patch("zobi.sql.execution.celery_task.security_manager", MagicMock())

    log_fn = _make_log_query_fn(mock_database)
    log_fn("SELECT * FROM users", "public")

    if should_be_called:
        assert mock_logger is not None
        mock_logger.assert_called_once()
    # If no logger, the function should complete without error


# =============================================================================
# Main Task Execution Tests
# =============================================================================


def test_execute_sql_task_success(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
    mock_result_set: MagicMock,
) -> None:
    """Test successful execute_sql_task (covers lines 339-352, 400-473)."""
    from zobi.sql.execution.celery_task import execute_sql_task

    from .conftest import setup_mock_raw_connection

    mock_query.database = mock_database
    mock_query.status = QueryStatusEnum.PENDING

    mocker.patch(
        "zobi.sql.execution.celery_task._get_query", return_value=mock_query
    )
    # execute_sql_with_cursor returns (exec_sql, result_set, time, rowcount)
    mocker.patch(
        "zobi.sql.execution.celery_task.execute_sql_with_cursor",
        return_value=[("SELECT * FROM users", mock_result_set, 10.5, 2)],
    )
    mocker.patch("zobi.sql.execution.celery_task.results_backend", None)
    mocker.patch("zobi.results_backend_use_msgpack", False)
    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch("zobi.dataframe.df_to_records", return_value=[])
    mocker.patch("zobi.sql.execution.celery_task.security_manager")
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": MagicMock()})

    setup_mock_raw_connection(mock_database)

    result = execute_sql_task(123, "SELECT * FROM users", username="admin")

    assert result is not None  # Success returns payload
    assert result["status"] == QueryStatusEnum.SUCCESS
    assert mock_query.status == QueryStatusEnum.SUCCESS


def test_execute_sql_task_with_start_time(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
    mock_result_set: MagicMock,
) -> None:
    """Test execute_sql_task accepts start_time parameter (covers line 400-402)."""
    import time

    from zobi.sql.execution.celery_task import execute_sql_task

    mock_query.database = mock_database

    mocker.patch(
        "zobi.sql.execution.celery_task._get_query", return_value=mock_query
    )
    # execute_sql_with_cursor returns (exec_sql, result_set, time, rowcount)
    mocker.patch(
        "zobi.sql.execution.celery_task.execute_sql_with_cursor",
        return_value=[("SELECT * FROM users", mock_result_set, 10.5, 2)],
    )
    mocker.patch("zobi.sql.execution.celery_task.results_backend", None)
    mocker.patch("zobi.results_backend_use_msgpack", False)
    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch("zobi.dataframe.df_to_records", return_value=[])
    mocker.patch("zobi.sql.execution.celery_task.security_manager")
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": MagicMock()})

    from .conftest import setup_mock_raw_connection

    setup_mock_raw_connection(mock_database)

    start_time = time.time() - 1.0
    result = execute_sql_task(123, "SELECT * FROM users", start_time=start_time)

    # Verify task completes successfully with start_time
    assert result is not None
    assert result["status"] == QueryStatusEnum.SUCCESS


def test_execute_sql_task_with_cancel_query_id(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
    mock_result_set: MagicMock,
) -> None:
    """Test execute_sql_task sets cancel_query_id when available."""
    from zobi.sql.execution.celery_task import execute_sql_task

    mock_query.database = mock_database
    mock_database.db_engine_spec.get_cancel_query_id.return_value = "cancel_123"

    mocker.patch(
        "zobi.sql.execution.celery_task._get_query", return_value=mock_query
    )
    # execute_sql_with_cursor returns (exec_sql, result_set, time, rowcount)
    mocker.patch(
        "zobi.sql.execution.celery_task.execute_sql_with_cursor",
        return_value=[("SELECT * FROM users", mock_result_set, 10.5, 2)],
    )
    mocker.patch("zobi.sql.execution.celery_task.results_backend", None)
    mocker.patch("zobi.results_backend_use_msgpack", False)
    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch("zobi.dataframe.df_to_records", return_value=[])
    mocker.patch("zobi.sql.execution.celery_task.security_manager")
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": MagicMock()})

    from .conftest import setup_mock_raw_connection

    setup_mock_raw_connection(mock_database)

    execute_sql_task(123, "SELECT * FROM users")

    # Verify cancel_query_id was set via db_engine_spec
    mock_database.db_engine_spec.get_cancel_query_id.assert_called_once()
    mock_query.set_extra_json_key.assert_any_call("cancel_query", "cancel_123")


def test_execute_sql_task_stopped(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test execute_sql_task when query is stopped (covers lines 456-458)."""
    from zobi.sql.execution.celery_task import execute_sql_task

    mock_query.database = mock_database

    mocker.patch(
        "zobi.sql.execution.celery_task._get_query", return_value=mock_query
    )
    # Empty list indicates stopped (check_stopped_fn returned True mid-execution)
    mocker.patch(
        "zobi.sql.execution.celery_task.execute_sql_with_cursor",
        return_value=[],
    )
    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch("zobi.sql.execution.celery_task.security_manager")
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": MagicMock()})

    from .conftest import setup_mock_raw_connection

    setup_mock_raw_connection(mock_database)

    result = execute_sql_task(123, "SELECT * FROM users")

    assert result["status"] == QueryStatusEnum.STOPPED


def test_execute_sql_task_with_mutation(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
    mock_result_set: MagicMock,
) -> None:
    """Test execute_sql_task commits for mutations (covers lines 461-462)."""
    from zobi.sql.execution.celery_task import execute_sql_task

    mock_query.database = mock_database
    mock_query.select_as_cta = True  # Trigger mutation commit

    mocker.patch(
        "zobi.sql.execution.celery_task._get_query", return_value=mock_query
    )
    # execute_sql_with_cursor returns (exec_sql, result_set, time, rowcount)
    mocker.patch(
        "zobi.sql.execution.celery_task.execute_sql_with_cursor",
        return_value=[("INSERT INTO users VALUES (1)", mock_result_set, 5.0, 1)],
    )
    mocker.patch("zobi.sql.execution.celery_task.results_backend", None)
    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch("zobi.dataframe.df_to_records", return_value=[])
    mocker.patch("zobi.sql.execution.celery_task.security_manager")
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": MagicMock()})

    from .conftest import setup_mock_raw_connection

    mock_conn = setup_mock_raw_connection(mock_database)

    execute_sql_task(123, "INSERT INTO users VALUES (1)")

    mock_conn.commit.assert_called()


def test_execute_sql_task_with_results_backend(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
    mock_result_set: MagicMock,
) -> None:
    """Test execute_sql_task stores results in backend (covers lines 466-467)."""
    from zobi.sql.execution.celery_task import execute_sql_task

    mock_query.database = mock_database

    mocker.patch(
        "zobi.sql.execution.celery_task._get_query", return_value=mock_query
    )
    # execute_sql_with_cursor returns (exec_sql, result_set, time, rowcount)
    mocker.patch(
        "zobi.sql.execution.celery_task.execute_sql_with_cursor",
        return_value=[("SELECT * FROM users", mock_result_set, 10.5, 2)],
    )

    mock_results_backend = MagicMock()
    mock_results_backend.set.return_value = True
    mocker.patch(
        "zobi.sql.execution.celery_task.results_backend", mock_results_backend
    )
    mocker.patch("zobi.results_backend_use_msgpack", False)
    mocker.patch(
        "zobi.sql.execution.celery_task.zlib_compress", return_value=b"data"
    )
    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch("zobi.dataframe.df_to_records", return_value=[])
    mocker.patch("zobi.sql.execution.celery_task.security_manager")
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": MagicMock()})

    from .conftest import setup_mock_raw_connection

    setup_mock_raw_connection(mock_database)

    result = execute_sql_task(123, "SELECT * FROM users")

    mock_results_backend.set.assert_called_once()
    assert result is not None
    assert result["status"] == QueryStatusEnum.SUCCESS


def test_execute_sql_task_timeout(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
) -> None:
    """Test execute_sql_task handles timeout (covers lines 438-453)."""
    from zobi.sql.execution.celery_task import execute_sql_task

    mock_query.database = mock_database

    mocker.patch(
        "zobi.sql.execution.celery_task._get_query", return_value=mock_query
    )
    mocker.patch(
        "zobi.sql.execution.celery_task.execute_sql_with_cursor",
        side_effect=SoftTimeLimitExceeded(),
    )
    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch("zobi.sql.execution.celery_task.security_manager")
    mocker.patch.dict(
        current_app.config,
        {"STATS_LOGGER": MagicMock(), "SQLLAB_ASYNC_TIME_LIMIT_SEC": 300},
    )

    from .conftest import setup_mock_raw_connection

    setup_mock_raw_connection(mock_database)

    result = execute_sql_task(123, "SELECT * FROM users")

    # TIMED_OUT status is preserved (not overwritten to FAILED)
    assert result["status"] == QueryStatusEnum.TIMED_OUT.value


def test_execute_sql_task_unhandled_exception(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
) -> None:
    """Test execute_sql_task handles unhandled exceptions (covers lines 347-352)."""
    from zobi.sql.execution.celery_task import execute_sql_task

    # Mock _get_query to succeed first time (for override_user), then return mock_query
    mocker.patch(
        "zobi.sql.execution.celery_task._get_query", return_value=mock_query
    )
    mocker.patch(
        "zobi.sql.execution.celery_task._execute_sql_statements",
        side_effect=Exception("Unexpected error"),
    )
    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch("zobi.sql.execution.celery_task.security_manager")
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": MagicMock()})

    result = execute_sql_task(123, "SELECT * FROM users")

    assert result["status"] == QueryStatusEnum.FAILED


def test_execute_sql_task_success_final_commit(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
    mock_result_set: MagicMock,
) -> None:
    """Test execute_sql_task final success path (covers lines 469-473)."""
    from zobi.sql.execution.celery_task import execute_sql_task

    mock_query.database = mock_database
    mock_query.status = QueryStatusEnum.RUNNING  # Will be changed to SUCCESS

    mocker.patch(
        "zobi.sql.execution.celery_task._get_query", return_value=mock_query
    )
    # execute_sql_with_cursor returns (exec_sql, result_set, time, rowcount)
    mocker.patch(
        "zobi.sql.execution.celery_task.execute_sql_with_cursor",
        return_value=[("SELECT * FROM users", mock_result_set, 10.5, 2)],
    )
    mocker.patch("zobi.sql.execution.celery_task.results_backend", None)
    mocker.patch("zobi.results_backend_use_msgpack", False)
    mock_session = mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch("zobi.dataframe.df_to_records", return_value=[])
    mocker.patch("zobi.sql.execution.celery_task.security_manager")
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": MagicMock()})

    from .conftest import setup_mock_raw_connection

    setup_mock_raw_connection(mock_database)

    result = execute_sql_task(123, "SELECT * FROM users")

    assert result is not None
    assert result["status"] == QueryStatusEnum.SUCCESS
    assert mock_query.status == QueryStatusEnum.SUCCESS
    mock_session.commit.assert_called()


def test_execute_sql_task_with_failed_status_before_final_commit(
    mocker: MockerFixture,
    app_context: None,
    mock_query: MagicMock,
    mock_database: MagicMock,
    mock_result_set: MagicMock,
) -> None:
    """Test execute_sql_task final commit when query.status is already FAILED."""
    from zobi.sql.execution.celery_task import execute_sql_task

    mock_query.database = mock_database

    mocker.patch(
        "zobi.sql.execution.celery_task._get_query", return_value=mock_query
    )
    # execute_sql_with_cursor returns (exec_sql, result_set, time, rowcount)
    mocker.patch(
        "zobi.sql.execution.celery_task.execute_sql_with_cursor",
        return_value=[("SELECT * FROM users", mock_result_set, 10.5, 2)],
    )

    # Mock _store_results_in_backend to set status to FAILED without raising
    def mock_store_results(query, payload, database):
        query.status = QueryStatusEnum.FAILED

    mocker.patch("zobi.sql.execution.celery_task.results_backend", MagicMock())
    mocker.patch("zobi.results_backend_use_msgpack", False)
    mocker.patch(
        "zobi.sql.execution.celery_task._store_results_in_backend",
        side_effect=mock_store_results,
    )
    mocker.patch("zobi.sql.execution.celery_task.db.session")
    mocker.patch("zobi.dataframe.df_to_records", return_value=[])
    mocker.patch("zobi.sql.execution.celery_task.security_manager")
    mocker.patch.dict(current_app.config, {"STATS_LOGGER": MagicMock()})

    from .conftest import setup_mock_raw_connection

    setup_mock_raw_connection(mock_database)

    result = execute_sql_task(123, "SELECT * FROM users")

    # Verify query status remains FAILED and is not changed to SUCCESS
    assert result is not None
    assert mock_query.status == QueryStatusEnum.FAILED
