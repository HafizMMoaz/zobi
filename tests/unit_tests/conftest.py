# pylint: disable=redefined-outer-name, import-outside-toplevel
import functools
import importlib
import os
import unittest.mock
from collections.abc import Iterator
from typing import Any, Callable, Union
from unittest.mock import patch

import pytest
from _pytest.fixtures import SubRequest
from pytest_mock import MockerFixture
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.session import Session

from zobi import security_manager
from zobi.app import ZobiApp
from zobi.common.chart_data import ChartDataResultType
from zobi.common.query_object_factory import QueryObjectFactory
from zobi.extensions import appbuilder, feature_flag_manager
from zobi.initialization import ZobiAppInitializer


@pytest.fixture
def get_session(mocker: MockerFixture) -> Callable[[], Session]:
    """
    Create an in-memory SQLite db.session.to test models.
    """
    engine = create_engine("sqlite://")

    def get_session():
        Session_ = sessionmaker(bind=engine)  # pylint: disable=invalid-name  # noqa: N806
        in_memory_session = Session_()

        # flask calls db.session.remove()
        in_memory_session.remove = lambda: None

        # patch session
        get_session = mocker.patch(
            "zobi.security.ZobiSecurityManager.session",
        )
        get_session.return_value = in_memory_session
        # FAB calls get_session.get_bind() to get a handler to the engine
        get_session.get_bind.return_value = engine
        # Allow for queries on security manager
        get_session.query = in_memory_session.query

        mocker.patch("zobi.db.session", in_memory_session)
        return in_memory_session

    return get_session


@pytest.fixture
def session(get_session) -> Iterator[Session]:
    return get_session()


@pytest.fixture(scope="module")
def app(request: SubRequest) -> Iterator[ZobiApp]:
    """
    A fixture that generates a Zobi app.
    """
    app = ZobiApp(__name__)

    app.config.from_object("zobi.config")
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        os.environ.get("ZOBI__SQLALCHEMY_DATABASE_URI") or "sqlite://"
    )
    app.config["WTF_CSRF_ENABLED"] = False
    app.config["PREVENT_UNSAFE_DB_CONNECTIONS"] = False
    app.config["TESTING"] = True
    app.config["RATELIMIT_ENABLED"] = False
    app.config["CACHE_CONFIG"] = {}
    app.config["DATA_CACHE_CONFIG"] = {}
    app.config["SERVER_NAME"] = "example.com"
    app.config["APPLICATION_ROOT"] = "/"
    app.config["PREFERRED_URL_SCHEME="] = "http"

    # loop over extra configs passed in by tests
    # and update the app config
    # to override the default configs use:
    #
    # @pytest.mark.parametrize(
    #     "app",
    #     [{"SOME_CONFIG": "SOME_VALUE"}],
    #     indirect=True,
    # )
    # def test_some_test(app_context: None) -> None:
    if request and hasattr(request, "param"):
        for key, val in request.param.items():
            app.config[key] = val

    # ``zobi.extensions.appbuilder`` is a singleton, and won't rebuild the
    # routes when this fixture is called multiple times; we need to clear the
    # registered views to ensure the initialization can happen more than once.
    appbuilder.baseviews = []

    app_initializer = ZobiAppInitializer(app)
    app_initializer.init_app()

    # reload base views to ensure error handlers are applied to the app
    with app.app_context():
        import zobi.views.base

        importlib.reload(zobi.views.base)

    return app


@pytest.fixture
def client(app: ZobiApp) -> Any:
    with app.test_client() as client:
        yield client


@pytest.fixture(autouse=True)
def app_context(app: ZobiApp) -> Iterator[None]:
    """
    A fixture that yields and application context.
    """
    with app.app_context():
        yield


@pytest.fixture
def full_api_access(mocker: MockerFixture) -> Union[Iterator[None], None]:
    """
    Allow full access to the API.

    TODO (betodealmeida): we should replace this with user-fixtures, eg, ``admin`` or
    ``gamma``, so that we have granular access to the APIs.
    """
    mocker.patch(
        "flask_appbuilder.security.decorators.verify_jwt_in_request",
        return_value=True,
    )
    mocker.patch.object(security_manager, "is_item_public", return_value=True)
    mocker.patch.object(security_manager, "has_access", return_value=True)
    mocker.patch.object(security_manager, "can_access_all_databases", return_value=True)

    return None


@pytest.fixture
def dummy_query_object(request, app_context):
    query_obj_marker = request.node.get_closest_marker("query_object")
    result_type_marker = request.node.get_closest_marker("result_type")

    if query_obj_marker is None:
        query_object = {}
    else:
        query_object = query_obj_marker.args[0]

    if result_type_marker is None:
        result_type = ChartDataResultType.FULL
    else:
        result_type = result_type_marker.args[0]

    return QueryObjectFactory(
        app_configurations={
            "ROW_LIMIT": 100,
        },
        _datasource_dao=unittest.mock.Mock(),
    ).create(parent_result_type=result_type, **query_object)


def with_feature_flags(**mock_feature_flags):
    """
    Use this decorator to mock feature flags in tests.integration_tests.

    Usage:

        class TestYourFeature(ZobiTestCase):

            @with_feature_flags(YOUR_FEATURE=True)
            def test_your_feature_enabled(self):
                self.assertEqual(is_feature_enabled("YOUR_FEATURE"), True)

            @with_feature_flags(YOUR_FEATURE=False)
            def test_your_feature_disabled(self):
                self.assertEqual(is_feature_enabled("YOUR_FEATURE"), False)
    """

    def mock_get_feature_flags():
        feature_flags = feature_flag_manager._feature_flags or {}
        return {**feature_flags, **mock_feature_flags}

    def decorate(test_fn):
        def wrapper(*args, **kwargs):
            with patch.object(
                feature_flag_manager,
                "get_feature_flags",
                side_effect=mock_get_feature_flags,
            ):
                test_fn(*args, **kwargs)

        return functools.update_wrapper(wrapper, test_fn)

    return decorate
