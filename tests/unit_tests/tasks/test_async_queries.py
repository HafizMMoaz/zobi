from unittest import mock

import pytest
from flask_babel import lazy_gettext as _

from zobi.commands.chart.exceptions import ChartDataQueryFailedError
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType
from zobi.exceptions import (
    OAuth2RedirectError,
    ZobiErrorException,
    ZobiErrorsException,
    ZobiVizException,
)


@mock.patch("zobi.tasks.async_queries.security_manager")
@mock.patch("zobi.tasks.async_queries.async_query_manager")
@mock.patch("zobi.tasks.async_queries.ChartDataQueryContextSchema")
def test_load_chart_data_into_cache_with_error(
    mock_query_context_schema_cls, mock_async_query_manager, mock_security_manager
):
    """Test that the task is gracefully marked failed in event of error"""
    from zobi.tasks.async_queries import load_chart_data_into_cache

    job_metadata = {"user_id": 1}
    form_data = {}
    err_message = "Something went wrong"
    err = ChartDataQueryFailedError(_(err_message))

    mock_user = mock.MagicMock()
    mock_query_context_schema = mock.MagicMock()

    mock_security_manager.get_user_by_id.return_value = mock_user
    mock_async_query_manager.STATUS_ERROR = "error"
    mock_query_context_schema_cls.return_value = mock_query_context_schema

    mock_query_context_schema.load.side_effect = err

    with pytest.raises(ChartDataQueryFailedError):
        load_chart_data_into_cache(job_metadata, form_data)

    expected_errors = [{"message": err_message}]

    mock_async_query_manager.update_job.assert_called_once_with(
        job_metadata, "error", errors=expected_errors
    )


@mock.patch("zobi.tasks.async_queries.security_manager")
@mock.patch("zobi.tasks.async_queries.async_query_manager")
@mock.patch("zobi.tasks.async_queries.ChartDataQueryContextSchema")
def test_load_chart_data_into_cache_with_zobi_error_exception(
    mock_query_context_schema_cls, mock_async_query_manager, mock_security_manager
):
    """Test that ZobiErrorException extracts SIP-40 style errors"""
    from zobi.tasks.async_queries import load_chart_data_into_cache

    job_metadata = {"user_id": 1}
    form_data = {}

    zobi_error = ZobiError(
        message="Access denied to datasource",
        error_type=ZobiErrorType.DATASOURCE_SECURITY_ACCESS_ERROR,
        level=ErrorLevel.ERROR,
        extra={"datasource": "my_table"},
    )
    err = ZobiErrorException(zobi_error)

    mock_user = mock.MagicMock()
    mock_query_context_schema = mock.MagicMock()

    mock_security_manager.get_user_by_id.return_value = mock_user
    mock_async_query_manager.STATUS_ERROR = "error"
    mock_query_context_schema_cls.return_value = mock_query_context_schema

    mock_query_context_schema.load.side_effect = err

    with pytest.raises(ZobiErrorException):
        load_chart_data_into_cache(job_metadata, form_data)

    # Verify the full SIP-40 error structure is preserved
    call_args = mock_async_query_manager.update_job.call_args
    assert call_args[0] == (job_metadata, "error")
    errors = call_args[1]["errors"]
    assert len(errors) == 1
    assert errors[0]["message"] == "Access denied to datasource"
    assert errors[0]["error_type"] == ZobiErrorType.DATASOURCE_SECURITY_ACCESS_ERROR
    assert errors[0]["level"] == ErrorLevel.ERROR
    assert errors[0]["extra"]["datasource"] == "my_table"


@mock.patch("zobi.tasks.async_queries.security_manager")
@mock.patch("zobi.tasks.async_queries.async_query_manager")
@mock.patch("zobi.tasks.async_queries.ChartDataQueryContextSchema")
def test_load_chart_data_into_cache_with_zobi_errors_exception(
    mock_query_context_schema_cls, mock_async_query_manager, mock_security_manager
):
    """Test that ZobiErrorsException extracts multiple SIP-40 style errors"""
    from zobi.tasks.async_queries import load_chart_data_into_cache

    job_metadata = {"user_id": 1}
    form_data = {}

    zobi_errors = [
        ZobiError(
            message="Column not found",
            error_type=ZobiErrorType.COLUMN_DOES_NOT_EXIST_ERROR,
            level=ErrorLevel.ERROR,
        ),
        ZobiError(
            message="Table not found",
            error_type=ZobiErrorType.TABLE_DOES_NOT_EXIST_ERROR,
            level=ErrorLevel.WARNING,
        ),
    ]
    err = ZobiErrorsException(zobi_errors)

    mock_user = mock.MagicMock()
    mock_query_context_schema = mock.MagicMock()

    mock_security_manager.get_user_by_id.return_value = mock_user
    mock_async_query_manager.STATUS_ERROR = "error"
    mock_query_context_schema_cls.return_value = mock_query_context_schema

    mock_query_context_schema.load.side_effect = err

    with pytest.raises(ZobiErrorsException):
        load_chart_data_into_cache(job_metadata, form_data)

    # Verify all SIP-40 errors are preserved
    call_args = mock_async_query_manager.update_job.call_args
    assert call_args[0] == (job_metadata, "error")
    errors = call_args[1]["errors"]
    assert len(errors) == 2
    assert errors[0]["message"] == "Column not found"
    assert errors[0]["error_type"] == ZobiErrorType.COLUMN_DOES_NOT_EXIST_ERROR
    assert errors[0]["level"] == ErrorLevel.ERROR
    assert errors[1]["message"] == "Table not found"
    assert errors[1]["error_type"] == ZobiErrorType.TABLE_DOES_NOT_EXIST_ERROR
    assert errors[1]["level"] == ErrorLevel.WARNING


@mock.patch("zobi.tasks.async_queries.security_manager")
@mock.patch("zobi.tasks.async_queries.async_query_manager")
@mock.patch("zobi.tasks.async_queries.get_viz")
@mock.patch("zobi.tasks.async_queries.get_datasource_info")
def test_load_explore_json_into_cache_preserves_oauth2_redirect_error(
    mock_get_datasource_info,
    mock_get_viz,
    mock_async_query_manager,
    mock_security_manager,
):
    """
    OAuth2RedirectError raised by ``viz_obj.get_payload`` must reach the async
    job's errors list as a structured SIP-40 envelope so the frontend can
    render the OAuth2 banner identically to the sync legacy path.
    """
    from zobi.tasks.async_queries import load_explore_json_into_cache

    job_metadata = {"user_id": 1}
    form_data: dict = {}

    mock_get_datasource_info.return_value = (1, "table")
    mock_security_manager.get_user_by_id.return_value = mock.MagicMock()
    mock_async_query_manager.STATUS_ERROR = "error"

    viz_obj = mock.MagicMock()
    viz_obj.get_payload.side_effect = OAuth2RedirectError(
        url="https://accounts.example.com/o/oauth2/v2/auth?...",
        tab_id="tab-123",
        redirect_uri="https://zobi.example.com/oauth2/redirect",
    )
    mock_get_viz.return_value = viz_obj

    with pytest.raises(OAuth2RedirectError):
        load_explore_json_into_cache(job_metadata, form_data)

    call_args = mock_async_query_manager.update_job.call_args
    assert call_args[0] == (job_metadata, "error")
    errors = call_args[1]["errors"]
    assert len(errors) == 1
    assert errors[0]["error_type"] == ZobiErrorType.OAUTH2_REDIRECT
    assert errors[0]["extra"] == {
        "url": "https://accounts.example.com/o/oauth2/v2/auth?...",
        "tab_id": "tab-123",
        "redirect_uri": "https://zobi.example.com/oauth2/redirect",
    }


@mock.patch("zobi.tasks.async_queries.security_manager")
@mock.patch("zobi.tasks.async_queries.async_query_manager")
@mock.patch("zobi.tasks.async_queries.get_viz")
@mock.patch("zobi.tasks.async_queries.get_datasource_info")
def test_load_explore_json_into_cache_preserves_zobi_errors_exception(
    mock_get_datasource_info,
    mock_get_viz,
    mock_async_query_manager,
    mock_security_manager,
):
    """ZobiErrorsException must be preserved as a list of SIP-40 dicts."""
    from zobi.tasks.async_queries import load_explore_json_into_cache

    job_metadata = {"user_id": 1}
    form_data: dict = {}

    mock_get_datasource_info.return_value = (1, "table")
    mock_security_manager.get_user_by_id.return_value = mock.MagicMock()
    mock_async_query_manager.STATUS_ERROR = "error"

    viz_obj = mock.MagicMock()
    viz_obj.get_payload.side_effect = ZobiErrorsException(
        [
            ZobiError(
                message="Column not found",
                error_type=ZobiErrorType.COLUMN_DOES_NOT_EXIST_ERROR,
                level=ErrorLevel.ERROR,
            ),
            ZobiError(
                message="Table not found",
                error_type=ZobiErrorType.TABLE_DOES_NOT_EXIST_ERROR,
                level=ErrorLevel.WARNING,
            ),
        ]
    )
    mock_get_viz.return_value = viz_obj

    with pytest.raises(ZobiErrorsException):
        load_explore_json_into_cache(job_metadata, form_data)

    errors = mock_async_query_manager.update_job.call_args[1]["errors"]
    assert len(errors) == 2
    assert errors[0]["error_type"] == ZobiErrorType.COLUMN_DOES_NOT_EXIST_ERROR
    assert errors[1]["error_type"] == ZobiErrorType.TABLE_DOES_NOT_EXIST_ERROR


@mock.patch("zobi.tasks.async_queries.security_manager")
@mock.patch("zobi.tasks.async_queries.async_query_manager")
@mock.patch("zobi.tasks.async_queries.get_viz")
@mock.patch("zobi.tasks.async_queries.get_datasource_info")
def test_load_explore_json_into_cache_preserves_zobi_viz_exception(
    mock_get_datasource_info,
    mock_get_viz,
    mock_async_query_manager,
    mock_security_manager,
):
    """
    Test that ZobiVizException passes ``ex.errors`` straight through.
    """
    from zobi.tasks.async_queries import load_explore_json_into_cache

    job_metadata = {"user_id": 1}
    form_data: dict = {}

    mock_get_datasource_info.return_value = (1, "table")
    mock_security_manager.get_user_by_id.return_value = mock.MagicMock()
    mock_async_query_manager.STATUS_ERROR = "error"

    payload_errors = [
        {
            "message": "Bad column",
            "error_type": ZobiErrorType.VIZ_GET_DF_ERROR,
            "level": ErrorLevel.ERROR,
        }
    ]
    viz_obj = mock.MagicMock()
    viz_obj.get_payload.return_value = {"errors": payload_errors}
    viz_obj.has_error.return_value = True
    mock_get_viz.return_value = viz_obj

    with pytest.raises(ZobiVizException):
        load_explore_json_into_cache(job_metadata, form_data)

    errors = mock_async_query_manager.update_job.call_args[1]["errors"]
    assert errors == payload_errors


@mock.patch("zobi.tasks.async_queries.security_manager")
@mock.patch("zobi.tasks.async_queries.async_query_manager")
@mock.patch("zobi.tasks.async_queries.get_viz")
@mock.patch("zobi.tasks.async_queries.get_datasource_info")
def test_load_explore_json_into_cache_falls_back_to_string_for_generic_exception(
    mock_get_datasource_info,
    mock_get_viz,
    mock_async_query_manager,
    mock_security_manager,
):
    """
    Test that Non-Zobi exception are passed as plain-string error.
    """
    from zobi.tasks.async_queries import load_explore_json_into_cache

    job_metadata = {"user_id": 1}
    form_data: dict = {}

    mock_get_datasource_info.return_value = (1, "table")
    mock_security_manager.get_user_by_id.return_value = mock.MagicMock()
    mock_async_query_manager.STATUS_ERROR = "error"

    viz_obj = mock.MagicMock()
    viz_obj.get_payload.side_effect = RuntimeError("boom")
    mock_get_viz.return_value = viz_obj

    with pytest.raises(RuntimeError):
        load_explore_json_into_cache(job_metadata, form_data)

    errors = mock_async_query_manager.update_job.call_args[1]["errors"]
    assert errors == ["boom"]
