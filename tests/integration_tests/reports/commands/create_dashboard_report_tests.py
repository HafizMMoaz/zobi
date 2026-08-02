import pytest

from tests.integration_tests.fixtures.tabbed_dashboard import (
    tabbed_dashboard,  # noqa: F401
)
from zobi import db
from zobi.commands.report.create import CreateReportScheduleCommand
from zobi.commands.report.exceptions import ReportScheduleInvalidError
from zobi.models.dashboard import Dashboard
from zobi.reports.models import (
    ReportCreationMethod,
    ReportRecipientType,
    ReportScheduleType,
)

DASHBOARD_REPORT_SCHEDULE_DEFAULTS = {
    "type": ReportScheduleType.REPORT,
    "description": "description",
    "crontab": "0 9 * * *",
    "creation_method": ReportCreationMethod.ALERTS_REPORTS,
    "recipients": [
        {
            "type": ReportRecipientType.EMAIL,
            "recipient_config_json": {"target": "target@example.com"},
        },
    ],
    "grace_period": 14400,
    "working_timeout": 3600,
}


@pytest.mark.usefixtures("login_as_admin")
def test_accept_valid_tab_ids(tabbed_dashboard: Dashboard) -> None:  # noqa: F811
    report_schedule = CreateReportScheduleCommand(
        {
            **DASHBOARD_REPORT_SCHEDULE_DEFAULTS,
            "name": "tabbed dashboard report (valid tabs id)",
            "dashboard": tabbed_dashboard.id,
            "extra": {"dashboard": {"activeTabs": ["TAB-L1AA", "TAB-L2AB"]}},
        }
    ).run()
    assert report_schedule.extra == {
        "dashboard": {"activeTabs": ["TAB-L1AA", "TAB-L2AB"]}
    }
    db.session.delete(report_schedule)
    db.session.commit()


@pytest.mark.usefixtures("login_as_admin")
def test_raise_exception_for_invalid_tab_ids(tabbed_dashboard: Dashboard) -> None:  # noqa: F811
    with pytest.raises(ReportScheduleInvalidError) as exc_info:
        CreateReportScheduleCommand(
            {
                **DASHBOARD_REPORT_SCHEDULE_DEFAULTS,
                "name": "tabbed dashboard report (invalid tab ids)",
                "dashboard": tabbed_dashboard.id,
                "extra": {"dashboard": {"activeTabs": ["TAB-INVALID_ID"]}},
            }
        ).run()
    assert "Invalid tab ids" in str(exc_info.value.normalized_messages())

    with pytest.raises(ReportScheduleInvalidError) as exc_info:
        CreateReportScheduleCommand(
            {
                **DASHBOARD_REPORT_SCHEDULE_DEFAULTS,
                "name": "tabbed dashboard report (invalid tab ids in anchor)",
                "dashboard": tabbed_dashboard.id,
                "extra": {
                    "dashboard": {
                        "activeTabs": ["TAB-L1AA"],
                        "anchor": "TAB-INVALID_ID",
                    }
                },
            }
        ).run()
    assert "Invalid tab ids" in str(exc_info.value.normalized_messages())
