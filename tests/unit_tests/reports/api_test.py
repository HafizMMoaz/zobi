from typing import Any
from unittest.mock import patch

import rison

from zobi.exceptions import ZobiException
from tests.unit_tests.conftest import with_feature_flags


@with_feature_flags(ALERT_REPORTS=True)
@patch("zobi.reports.api.get_channels_with_search")
def test_slack_channels_success(
    mock_search: Any,
    client: Any,
    full_api_access: None,
) -> None:
    mock_search.return_value = [{"id": "C123", "name": "general"}]
    params = rison.dumps({})
    rv = client.get(f"/api/v1/report/slack_channels/?q={params}")
    assert rv.status_code == 200
    data = rv.json
    assert data["result"] == [{"id": "C123", "name": "general"}]


@with_feature_flags(ALERT_REPORTS=True)
@patch("zobi.reports.api.get_channels_with_search")
def test_slack_channels_handles_zobi_exception(
    mock_search: Any,
    client: Any,
    full_api_access: None,
) -> None:
    mock_search.side_effect = ZobiException("Slack API error")
    params = rison.dumps({})
    rv = client.get(f"/api/v1/report/slack_channels/?q={params}")
    assert rv.status_code == 422
    assert "Slack API error" in rv.json["message"]
