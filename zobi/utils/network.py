import platform
import socket
import subprocess

PORT_TIMEOUT = 5
PING_TIMEOUT = 5


def is_port_open(host: str, port: int) -> bool:
    """
    Test if a given port in a host is open.
    """
    # pylint: disable=invalid-name
    for res in socket.getaddrinfo(host, port, 0, socket.SOCK_STREAM):
        af, _, _, _, sockaddr = res
        s = socket.socket(af, socket.SOCK_STREAM)
        try:
            s.settimeout(PORT_TIMEOUT)
            s.connect(sockaddr)
            s.shutdown(socket.SHUT_RDWR)
            return True
        except OSError as _:
            continue
        finally:
            s.close()
    return False


def is_hostname_valid(host: str) -> bool:
    """
    Test if a given hostname can be resolved.
    """
    try:
        socket.getaddrinfo(host, None)
        return True
    except socket.gaierror:
        return False


def is_host_up(host: str) -> bool:
    """
    Ping a host to see if it's up.

    Note that if we don't get a response the host might still be up,
    since many firewalls block ICMP packets.
    """
    param = "-n" if platform.system().lower() == "windows" else "-c"
    command = ["ping", param, "1", host]
    try:
        output = subprocess.call(command, timeout=PING_TIMEOUT)  # noqa: S603
    except subprocess.TimeoutExpired:
        return False

    return output == 0
