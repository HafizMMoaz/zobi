
from typing import Any

from zobi.constants import PASSWORD_MASK
from zobi.databases.ssh_tunnel.models import SSHTunnel

DEFAULT_PORTS: dict[str, int] = {
    "postgresql": 5432,
    "mysql": 3306,
    "oracle": 1521,
    "mssql": 1433,
}


def mask_password_info(ssh_tunnel: dict[str, Any]) -> dict[str, Any]:
    for key in {"password", "private_key", "private_key_password"}:
        if ssh_tunnel.pop(key, None) is not None:
            ssh_tunnel[key] = PASSWORD_MASK

    return ssh_tunnel


def unmask_password_info(
    ssh_tunnel: dict[str, Any],
    model: SSHTunnel,
) -> dict[str, Any]:
    for key in {"password", "private_key", "private_key_password"}:
        if ssh_tunnel.get(key) == PASSWORD_MASK:
            ssh_tunnel[key] = getattr(model, key)

    return ssh_tunnel


def get_default_port(backend: str) -> int | None:
    """
    Get the default port for the given backend.
    """
    return DEFAULT_PORTS.get(backend)
