import contextlib
from typing import Callable, ContextManager

import pytest
from flask_appbuilder.security.sqla import models as ab_models

from zobi import db
from zobi.models.sql_lab import Query
from zobi.utils.core import shortid
from zobi.utils.database import get_example_database


def force_async_run(allow_run_async: bool):
    example_db = get_example_database()
    orig_allow_run_async = example_db.allow_run_async

    example_db.allow_run_async = allow_run_async
    db.session.commit()

    yield example_db

    example_db.allow_run_async = orig_allow_run_async
    db.session.commit()


@pytest.fixture
def non_async_example_db(app_context):
    gen = force_async_run(False)
    yield next(gen)
    with contextlib.suppress(StopIteration):
        next(gen)


@pytest.fixture
def async_example_db(app_context):
    gen = force_async_run(True)
    yield next(gen)
    with contextlib.suppress(StopIteration):
        next(gen)


@pytest.fixture
def example_query(get_or_create_user: Callable[..., ContextManager[ab_models.User]]):
    with get_or_create_user("sqllab-test-user") as user:
        query = Query(
            client_id=shortid()[:10], database=get_example_database(), user=user
        )
        db.session.add(query)
        db.session.commit()
        yield query
        db.session.delete(query)
        db.session.commit()
