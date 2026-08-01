
from parameterized import parameterized

from zobi.commands.database.test_connection import get_log_connection_action
from zobi.databases.ssh_tunnel.models import SSHTunnel


@parameterized.expand(
    [
        ("foo", None, None, "foo"),
        ("foo", SSHTunnel, None, "foo.ssh_tunnel"),
        ("foo", SSHTunnel, Exception("oops"), "foo.Exception.ssh_tunnel"),
    ],
)
def test_get_log_connection_action(action, tunnel, exc, expected_result):
    assert expected_result == get_log_connection_action(action, tunnel, exc)
