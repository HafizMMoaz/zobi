from typing import Any
from unittest.mock import MagicMock

import pytest
from marshmallow import ValidationError
from pytest_mock import MockerFixture

from zobi.commands.report.create import CreateReportScheduleCommand
from zobi.commands.report.exceptions import (
    DatabaseNotFoundValidationError,
    ReportScheduleAlertRequiredDatabaseValidationError,
    ReportScheduleInvalidError,
)
from zobi.reports.models import ReportScheduleType
from zobi.utils import json


def _make_dashboard(position: dict[str, Any]) -> MagicMock:
    dashboard = MagicMock()
    dashboard.position_json = json.dumps(position)
    return dashboard


def test_validate_report_extra_null_extra() -> None:
    command = CreateReportScheduleCommand({})
    command._properties = {"extra": None}

    exceptions: list[ValidationError] = []
    command._validate_report_extra(exceptions)

    assert len(exceptions) == 0


def test_validate_report_extra_null_dashboard() -> None:
    command = CreateReportScheduleCommand({})
    command._properties = {"extra": {"dashboard": {}}, "dashboard": None}

    exceptions: list[ValidationError] = []
    command._validate_report_extra(exceptions)

    assert len(exceptions) == 0


def test_validate_report_extra_empty_active_tabs() -> None:
    command = CreateReportScheduleCommand({})
    command._properties = {
        "extra": {"dashboard": {"activeTabs": []}},
        "dashboard": _make_dashboard({"TAB-1": {}, "TAB-2": {}}),
    }

    exceptions: list[ValidationError] = []
    command._validate_report_extra(exceptions)

    assert len(exceptions) == 0


def test_validate_report_extra_valid_tabs() -> None:
    command = CreateReportScheduleCommand({})
    command._properties = {
        "extra": {"dashboard": {"activeTabs": ["TAB-1"]}},
        "dashboard": _make_dashboard({"TAB-1": {}, "TAB-2": {}}),
    }

    exceptions: list[ValidationError] = []
    command._validate_report_extra(exceptions)

    assert len(exceptions) == 0


def test_validate_report_extra_invalid_tabs() -> None:
    command = CreateReportScheduleCommand({})
    command._properties = {
        "extra": {"dashboard": {"activeTabs": ["TAB-999"]}},
        "dashboard": _make_dashboard({"TAB-1": {}}),
    }

    exceptions: list[ValidationError] = []
    command._validate_report_extra(exceptions)

    assert len(exceptions) == 1
    assert exceptions[0].field_name == "extra"


def test_validate_report_extra_anchor_json_valid() -> None:
    command = CreateReportScheduleCommand({})
    command._properties = {
        "extra": {"dashboard": {"anchor": '["TAB-1"]'}},
        "dashboard": _make_dashboard({"TAB-1": {}}),
    }

    exceptions: list[ValidationError] = []
    command._validate_report_extra(exceptions)

    assert len(exceptions) == 0


def test_validate_report_extra_anchor_invalid_ids() -> None:
    command = CreateReportScheduleCommand({})
    command._properties = {
        "extra": {"dashboard": {"anchor": '["TAB-999"]'}},
        "dashboard": _make_dashboard({"TAB-1": {}}),
    }

    exceptions: list[ValidationError] = []
    command._validate_report_extra(exceptions)

    assert len(exceptions) == 1
    assert exceptions[0].field_name == "extra"


def test_validate_report_extra_anchor_string_valid() -> None:
    command = CreateReportScheduleCommand({})
    command._properties = {
        "extra": {"dashboard": {"anchor": "TAB-1"}},
        "dashboard": _make_dashboard({"TAB-1": {}}),
    }

    exceptions: list[ValidationError] = []
    command._validate_report_extra(exceptions)

    assert len(exceptions) == 0


def test_validate_report_extra_anchor_string_invalid() -> None:
    command = CreateReportScheduleCommand({})
    command._properties = {
        "extra": {"dashboard": {"anchor": "TAB-999"}},
        "dashboard": _make_dashboard({"TAB-1": {}}),
    }

    exceptions: list[ValidationError] = []
    command._validate_report_extra(exceptions)

    assert len(exceptions) == 1
    assert exceptions[0].field_name == "extra"


# ---------------------------------------------------------------------------
# Phase 1 gap closure: validate() — alert + database combos
# ---------------------------------------------------------------------------


def _stub_validate_deps(mocker: MockerFixture) -> None:
    """Stub out all DAO and base-class calls inside validate() so the test
    can exercise a single validation branch in isolation."""
    mocker.patch.object(CreateReportScheduleCommand, "_populate_recipients")
    mocker.patch(
        "zobi.commands.report.create.ReportScheduleDAO.validate_update_uniqueness",
        return_value=True,
    )
    mocker.patch.object(CreateReportScheduleCommand, "validate_report_frequency")
    mocker.patch.object(CreateReportScheduleCommand, "validate_chart_dashboard")
    mocker.patch.object(CreateReportScheduleCommand, "_validate_report_extra")
    mocker.patch(
        "zobi.commands.report.create.ReportScheduleDAO.validate_unique_creation_method",
        return_value=True,
    )
    mocker.patch.object(CreateReportScheduleCommand, "populate_owners", return_value=[])


def test_validate_alert_missing_database_key(mocker: MockerFixture) -> None:
    """Alert type without a 'database' key raises the required-database error."""
    _stub_validate_deps(mocker)

    command = CreateReportScheduleCommand({})
    command._properties = {
        "type": ReportScheduleType.ALERT,
        "name": "Test Alert",
        "crontab": "* * * * *",
        "creation_method": "alerts_reports",
    }

    with pytest.raises(ReportScheduleInvalidError) as exc:
        command.validate()

    assert any(
        isinstance(e, ReportScheduleAlertRequiredDatabaseValidationError)
        for e in exc.value._exceptions
    )


def test_validate_alert_nonexistent_database(mocker: MockerFixture) -> None:
    """Alert type with a database ID that doesn't exist raises not-found."""
    _stub_validate_deps(mocker)
    mocker.patch(
        "zobi.commands.report.create.DatabaseDAO.find_by_id",
        return_value=None,
    )

    command = CreateReportScheduleCommand({})
    command._properties = {
        "type": ReportScheduleType.ALERT,
        "name": "Test Alert",
        "crontab": "* * * * *",
        "creation_method": "alerts_reports",
        "database": 999,
    }

    with pytest.raises(ReportScheduleInvalidError) as exc:
        command.validate()

    assert any(
        isinstance(e, DatabaseNotFoundValidationError) for e in exc.value._exceptions
    )
