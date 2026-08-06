"""A model chosen for one message must not silently become the thread's.

The composer offers a one-send override next to a persisted thread default. If
sending also wrote the alias to the row, the override would be indistinguishable
from the default and every send would quietly change the conversation.
"""

from typing import Any

import pytest
from pytest_mock import MockerFixture
from sqlalchemy.orm.session import Session

from zobi.models.chat import Conversation


@pytest.fixture
def chat_tables(session: Session, mocker: MockerFixture) -> Session:
    """Create the conversation table and stand in for the request's owner.

    Table creation matches the pattern in ``test_attachments.py``: the
    ``session`` fixture hands back a bare in-memory engine with no schema, so
    any test that reads or writes a ``Conversation`` row has to create the
    table itself first.

    ``_owned()`` in ``zobi/agent/api.py`` filters conversations by
    ``Conversation.user_id == get_user_id()``. ``full_api_access`` bypasses
    JWT verification and permission checks but never establishes a caller
    identity, so without this patch every request against a route that calls
    ``_owned()`` 404s before any of the code under test runs.
    """
    Conversation.metadata.create_all(session.get_bind())
    mocker.patch("zobi.agent.api.get_user_id", return_value=1)
    return session


def test_a_message_alias_is_used_for_the_turn(
    client: Any, full_api_access: None, mocker: MockerFixture, chat_tables: Session
) -> None:
    conversation = Conversation(user_id=1, mode="manual", model_alias="slow")
    chat_tables.add(conversation)
    chat_tables.flush()

    turn = mocker.patch("zobi.agent.api.AgentTurn")
    mocker.patch("zobi.agent.api.parse_mode", return_value="manual")

    client.post(
        f"/api/v1/zobi_agent/conversation/{conversation.id}/stream",
        json={"content": "hello", "model_alias": "fast"},
    )

    assert turn.call_args.args[2] == "fast"


def test_a_message_alias_is_not_written_to_the_conversation(
    client: Any, full_api_access: None, mocker: MockerFixture, chat_tables: Session
) -> None:
    conversation = Conversation(user_id=1, mode="manual", model_alias="slow")
    chat_tables.add(conversation)
    chat_tables.flush()

    mocker.patch("zobi.agent.api.AgentTurn")
    mocker.patch("zobi.agent.api.parse_mode", return_value="manual")

    client.post(
        f"/api/v1/zobi_agent/conversation/{conversation.id}/stream",
        json={"content": "hello", "model_alias": "fast"},
    )

    chat_tables.refresh(conversation)
    assert conversation.model_alias == "slow"


def test_without_an_override_the_thread_default_is_used(
    client: Any, full_api_access: None, mocker: MockerFixture, chat_tables: Session
) -> None:
    conversation = Conversation(user_id=1, mode="manual", model_alias="slow")
    chat_tables.add(conversation)
    chat_tables.flush()

    turn = mocker.patch("zobi.agent.api.AgentTurn")
    mocker.patch("zobi.agent.api.parse_mode", return_value="manual")

    client.post(
        f"/api/v1/zobi_agent/conversation/{conversation.id}/stream",
        json={"content": "hello"},
    )

    assert turn.call_args.args[2] == "slow"


def test_put_still_changes_the_thread_default(
    client: Any, full_api_access: None, chat_tables: Session
) -> None:
    conversation = Conversation(user_id=1, mode="manual", model_alias="slow")
    chat_tables.add(conversation)
    chat_tables.flush()

    response = client.put(
        f"/api/v1/zobi_agent/conversation/{conversation.id}",
        json={"model_alias": "fast"},
    )

    assert response.status_code == 200
    chat_tables.refresh(conversation)
    assert conversation.model_alias == "fast"
