# pylint: disable=import-outside-toplevel, unused-argument

from pytest_mock import MockerFixture


def test_memoized_func(mocker: MockerFixture) -> None:
    """
    Test the ``memoized_func`` decorator.
    """
    from zobi.utils.cache import memoized_func

    cache = mocker.MagicMock()

    decorator = memoized_func("db:{self.id}:schema:{schema}:view_list", cache)
    decorated = decorator(lambda self, schema, cache=False: 42)

    self = mocker.MagicMock()
    self.id = 1

    # skip cache
    result = decorated(self, "public", cache=False)
    assert result == 42
    cache.get.assert_not_called()

    # check cache, no cached value
    cache.get.return_value = None
    result = decorated(self, "public", cache=True)
    assert result == 42
    cache.get.assert_called_with("db:1:schema:public:view_list")

    # check cache, cached value
    cache.get.return_value = 43
    result = decorated(self, "public", cache=True)
    assert result == 43
