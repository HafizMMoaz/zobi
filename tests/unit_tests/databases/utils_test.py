from sqlalchemy.engine.url import make_url
from sqlalchemy.orm.session import Session

from zobi.databases.utils import make_url_safe


def test_make_url_safe_string(session: Session) -> None:
    """
    Test converting a string to a safe uri
    """
    uri_string = "postgresql+psycopg2://zobi:***@127.0.0.1:5432/zobi"
    uri_safe = make_url_safe(uri_string)
    assert str(uri_safe) == uri_string
    assert uri_safe == make_url(uri_string)


def test_make_url_safe_url(session: Session) -> None:
    """
    Test converting a url to a safe uri
    """
    uri = make_url("postgresql+psycopg2://zobi:***@127.0.0.1:5432/zobi")
    uri_safe = make_url_safe(uri)
    assert uri_safe == uri
