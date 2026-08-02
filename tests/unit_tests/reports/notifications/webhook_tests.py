import pandas as pd
import pytest

from zobi.reports.notifications.exceptions import (
    NotificationParamException,
)
from zobi.reports.notifications.webhook import WebhookNotification
from zobi.utils.core import HeaderDataType


@pytest.fixture
def mock_header_data() -> HeaderDataType:
    return {
        "notification_format": "PNG",
        "notification_type": "Alert",
        "owners": [1],
        "notification_source": None,
        "chart_id": None,
        "dashboard_id": None,
        "slack_channels": None,
        "execution_id": "test-execution-id",
    }


def test_get_webhook_url(mock_header_data) -> None:
    """
    Test the _get_webhook_url function to ensure it correctly extracts
    the webhook URL from recipient configuration
    """
    from zobi.reports.models import ReportRecipients, ReportRecipientType
    from zobi.reports.notifications.base import NotificationContent

    content = NotificationContent(
        name="test alert",
        header_data=mock_header_data,
        embedded_data=pd.DataFrame({"A": [1, 2, 3], "B": [4, 5, 6]}),
        description="Test description",
    )
    webhook_notification = WebhookNotification(
        recipient=ReportRecipients(
            type=ReportRecipientType.WEBHOOK,
            recipient_config_json='{"target": "https://example.com/webhook"}',
        ),
        content=content,
    )

    result = webhook_notification._get_webhook_url()

    assert result == "https://example.com/webhook"


def test_get_webhook_url_missing_url(mock_header_data) -> None:
    """
    Test that _get_webhook_url raises an exception when URL is missing
    """
    from zobi.reports.models import ReportRecipients, ReportRecipientType
    from zobi.reports.notifications.base import NotificationContent

    content = NotificationContent(
        name="test alert",
        header_data=mock_header_data,
        description="Test description",
    )
    webhook_notification = WebhookNotification(
        recipient=ReportRecipients(
            type=ReportRecipientType.WEBHOOK,
            recipient_config_json="{}",
        ),
        content=content,
    )

    with pytest.raises(NotificationParamException, match="Webhook URL is required"):
        webhook_notification._get_webhook_url()


def test_get_req_payload_basic(mock_header_data) -> None:
    """
    Test that _get_req_payload returns correct payload structure
    """
    from zobi.reports.models import ReportRecipients, ReportRecipientType
    from zobi.reports.notifications.base import NotificationContent

    content = NotificationContent(
        name="Payload Name",
        header_data=mock_header_data,
        embedded_data=None,
        description="Payload Description",
        url="http://example.com/report",
        text="Report Text",
    )
    webhook_notification = WebhookNotification(
        recipient=ReportRecipients(
            type=ReportRecipientType.WEBHOOK,
            recipient_config_json='{"target": "https://webhook.com"}',
        ),
        content=content,
    )

    payload = webhook_notification._get_req_payload()

    assert payload["name"] == "Payload Name"
    assert payload["description"] == "Payload Description"
    assert payload["url"] == "http://example.com/report"
    assert payload["text"] == "Report Text"
    assert isinstance(payload["header"], dict)
    # Optional fields from header_data
    assert payload["header"]["notification_format"] == "PNG"
    assert payload["header"]["notification_type"] == "Alert"


def test_get_files_includes_all_content_types(mock_header_data) -> None:
    """
    Test that _get_files correctly includes csv, pdf, and multiple screenshot attachments
    """  # noqa: E501

    from zobi.reports.models import ReportRecipients, ReportRecipientType
    from zobi.reports.notifications.base import NotificationContent

    csv_bytes = b"col1,col2\n1,2"
    pdf_bytes = b"%PDF-1.4"
    screenshots = [b"fakeimg1", b"fakeimg2"]

    content = NotificationContent(
        name="file test",
        header_data=mock_header_data,
        csv=csv_bytes,
        pdf=pdf_bytes,
        screenshots=screenshots,
        description="files test",
    )
    webhook_notification = WebhookNotification(
        recipient=ReportRecipients(
            type=ReportRecipientType.WEBHOOK,
            recipient_config_json='{"target": "https://webhook.com"}',
        ),
        content=content,
    )
    files = webhook_notification._get_files()
    # There should be 1 csv, 1 pdf, and 2 screenshots = 4 files total
    assert len(files) == 4

    file_names = [file_info[1][0] for file_info in files]
    assert "report.csv" in file_names
    assert "report.pdf" in file_names
    assert "screenshot_0.png" in file_names
    assert "screenshot_1.png" in file_names

    mime_types = [file_info[1][2] for file_info in files]
    assert "text/csv" in mime_types
    assert "application/pdf" in mime_types
    assert mime_types.count("image/png") == 2


def test_get_files_empty_when_no_content(mock_header_data) -> None:
    """
    Test that _get_files returns empty list when no files present
    """
    from zobi.reports.models import ReportRecipients, ReportRecipientType
    from zobi.reports.notifications.base import NotificationContent

    content = NotificationContent(
        name="no files",
        header_data=mock_header_data,
        description="no files test",
    )
    webhook_notification = WebhookNotification(
        recipient=ReportRecipients(
            type=ReportRecipientType.WEBHOOK,
            recipient_config_json='{"target": "https://webhook.com"}',
        ),
        content=content,
    )
    files = webhook_notification._get_files()
    assert files == []


def test_send_http_only_https_check(monkeypatch, mock_header_data) -> None:
    """
    Test send raises when URL is not HTTPS and config enforces HTTPS only
    """
    from zobi.reports.models import ReportRecipients, ReportRecipientType
    from zobi.reports.notifications.base import NotificationContent

    content = NotificationContent(
        name="test alert", header_data=mock_header_data, description="Test description"
    )
    webhook_notification = WebhookNotification(
        recipient=ReportRecipients(
            type=ReportRecipientType.WEBHOOK,
            recipient_config_json='{"target": "http://notsecure.com/webhook"}',
        ),
        content=content,
    )

    class MockCurrentApp:
        config = {"ALERT_REPORTS_WEBHOOK_HTTPS_ONLY": True}

    monkeypatch.setattr(
        "zobi.reports.notifications.webhook.current_app", MockCurrentApp
    )
    monkeypatch.setattr(
        "zobi.reports.notifications.webhook.feature_flag_manager.is_feature_enabled",
        lambda flag: True,
    )

    with pytest.raises(NotificationParamException, match="HTTPS is required by config"):
        webhook_notification.send()
