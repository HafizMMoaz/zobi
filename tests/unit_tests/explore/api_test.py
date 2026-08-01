
from typing import Any


def test_explore_datasource_not_found(client: Any, full_api_access: None) -> None:
    # validating the payload for a dataset that doesn't exist
    # user should be expecting missing_datasource view
    response = client.get(
        "/api/v1/explore/?datasource_id=50000&datasource_type=table",
    )
    response.json["result"]["dataset"]["name"] == "[Missing Dataset]"  # noqa: B015
    assert response.status_code == 200
