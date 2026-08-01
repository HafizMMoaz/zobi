from zobi.utils import json
from tests.conftest import with_config


@with_config({"ZOBI_WEBSERVER_DOMAINS": ["a", "b"]})
def test_get_available_domains(test_client, login_as_admin):
    resp = test_client.get("api/v1/available_domains/")
    assert resp.status_code == 200
    data = json.loads(resp.data.decode("utf-8"))
    result = data.get("result")
    assert result == {"domains": ["a", "b"]}
