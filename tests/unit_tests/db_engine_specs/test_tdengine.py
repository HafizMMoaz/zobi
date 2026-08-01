

from sqlalchemy.engine.url import make_url, URL  # noqa: F401


# test get schema
def test_get_schema_from_engine_params() -> None:
    """
    Test the ``get_schema_from_engine_params`` method.
    """
    from zobi.db_engine_specs.tdengine import TDengineEngineSpec

    assert (
        TDengineEngineSpec.get_schema_from_engine_params(
            make_url("taosws://root:taosdata@127.0.0.1:6041/dbname"), {}
        )
        == "dbname"
    )
