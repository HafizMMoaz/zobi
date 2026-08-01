from unittest.mock import MagicMock, patch


@patch("zobi.reports.filters.security_manager", new_callable=MagicMock)
def test_report_schedule_filter_admin_sees_all(mock_sm: MagicMock) -> None:
    from zobi.reports.filters import ReportScheduleFilter

    mock_sm.can_access_all_datasources.return_value = True
    query = MagicMock()
    f = ReportScheduleFilter("id", MagicMock())
    result = f.apply(query, None)
    assert result is query
    query.filter.assert_not_called()


@patch("zobi.reports.filters.security_manager", new_callable=MagicMock)
@patch("zobi.reports.filters.db")
def test_report_schedule_filter_non_admin_filtered(
    mock_db: MagicMock, mock_sm: MagicMock
) -> None:
    from zobi.reports.filters import ReportScheduleFilter

    mock_sm.can_access_all_datasources.return_value = False
    mock_sm.user_model.get_user_id.return_value = 1
    mock_sm.user_model.id = 1
    query = MagicMock()
    f = ReportScheduleFilter("id", MagicMock())
    f.apply(query, None)
    query.filter.assert_called_once()


def test_report_schedule_all_text_filter_empty_noop() -> None:
    from zobi.reports.filters import ReportScheduleAllTextFilter

    query = MagicMock()
    f = ReportScheduleAllTextFilter("name", MagicMock())
    result = f.apply(query, "")
    assert result is query
    query.filter.assert_not_called()


def test_report_schedule_all_text_filter_applies_ilike() -> None:
    from zobi.reports.filters import ReportScheduleAllTextFilter

    query = MagicMock()
    f = ReportScheduleAllTextFilter("name", MagicMock())
    f.apply(query, "test")
    query.filter.assert_called_once()
