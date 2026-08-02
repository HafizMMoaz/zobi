import pytest

from tests.integration_tests.test_app import app
from zobi import db
from zobi.tags.core import clear_sqla_event_listeners, register_sqla_event_listeners
from zobi.tags.models import Tag


@pytest.fixture
def with_tagging_system_feature():
    is_enabled = app.config["DEFAULT_FEATURE_FLAGS"]["TAGGING_SYSTEM"]
    if not is_enabled:
        app.config["DEFAULT_FEATURE_FLAGS"]["TAGGING_SYSTEM"] = True
        register_sqla_event_listeners()
        yield
        app.config["DEFAULT_FEATURE_FLAGS"]["TAGGING_SYSTEM"] = False
        clear_sqla_event_listeners()


@pytest.fixture
def create_custom_tags():
    with app.app_context():
        tags: list[Tag] = []
        for tag_name in {"first_tag", "second_tag", "third_tag"}:
            tag = Tag(
                name=tag_name,
                type="custom",
            )
            db.session.add(tag)
            db.session.commit()
            tags.append(tag)

        yield tags

        for tags in tags:  # noqa: B020
            db.session.delete(tags)
        db.session.commit()


# Helper function to return filter parameters
def get_filter_params(opr, value):
    return {
        "filters": [
            {
                "col": "tags",
                "opr": opr,
                "value": value,
            }
        ]
    }
