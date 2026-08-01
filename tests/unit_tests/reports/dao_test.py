from unittest.mock import MagicMock, patch


@patch("zobi.daos.report.get_user_id", return_value=1)
@patch("zobi.daos.report.db")
def test_validate_unique_creation_method_duplicate_returns_false(
    mock_db: MagicMock,
    mock_uid: MagicMock,
) -> None:
    from zobi.daos.report import ReportScheduleDAO

    # Simulate that a matching report already exists
    mock_db.session.query.return_value.filter_by.return_value.filter.return_value = (
        MagicMock()
    )
    mock_db.session.query.return_value.scalar.return_value = True
    assert ReportScheduleDAO.validate_unique_creation_method(dashboard_id=1) is False


@patch("zobi.daos.report.get_user_id", return_value=1)
@patch("zobi.daos.report.db")
def test_validate_unique_creation_method_no_duplicate_returns_true(
    mock_db: MagicMock,
    mock_uid: MagicMock,
) -> None:
    from zobi.daos.report import ReportScheduleDAO

    mock_db.session.query.return_value.filter_by.return_value.filter.return_value = (
        MagicMock()
    )
    mock_db.session.query.return_value.scalar.return_value = False
    assert ReportScheduleDAO.validate_unique_creation_method(dashboard_id=1) is True


@patch("zobi.daos.report.db")
def test_find_last_error_notification_returns_none_after_success(
    mock_db: MagicMock,
) -> None:
    from zobi.daos.report import ReportScheduleDAO

    schedule = MagicMock()
    error_log = MagicMock()
    success_log = MagicMock()

    # Build the query chain so each .query().filter().order_by().first() call
    # returns a different result. The DAO calls db.session.query() twice:
    # 1st call finds the error marker log
    # 2nd call finds a non-error log after it (success happened since last error email)
    query_mock = MagicMock()
    mock_db.session.query.return_value = query_mock
    chain = query_mock.filter.return_value.order_by.return_value
    chain.first.side_effect = [error_log, success_log]

    result = ReportScheduleDAO.find_last_error_notification(schedule)
    # Success log exists after error → should return None (no re-notification needed)
    assert result is None


@patch("zobi.daos.report.db")
def test_find_last_error_notification_returns_log_when_only_errors(
    mock_db: MagicMock,
) -> None:
    from zobi.daos.report import ReportScheduleDAO

    schedule = MagicMock()
    error_log = MagicMock()

    query_mock = MagicMock()
    mock_db.session.query.return_value = query_mock
    chain = query_mock.filter.return_value.order_by.return_value
    # 1st call: error marker log found; 2nd call: no success log after it
    chain.first.side_effect = [error_log, None]

    result = ReportScheduleDAO.find_last_error_notification(schedule)
    assert result is error_log
