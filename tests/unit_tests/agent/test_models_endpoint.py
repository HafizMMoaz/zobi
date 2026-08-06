"""Tests for the chat model list the composer's picker reads.

The gateway's own routes sit behind the Manage screen, so the agent API serves
this list instead: a chat user needs to know which models they may pick without
holding provider administration rights.
"""

from typing import Any

from pytest_mock import MockerFixture

from zobi.llm.service import NoModelForCapabilityError


def test_lists_distinct_active_chat_aliases_and_marks_the_default(
    client: Any, full_api_access: None, mocker: MockerFixture
) -> None:
    mocker.patch("zobi.agent.api.chat_aliases", return_value=["fast", "gpt-4o"])
    mocker.patch("zobi.agent.api.resolve_alias", return_value="gpt-4o")

    response = client.get("/api/v1/zobi_agent/models/")

    assert response.status_code == 200
    assert response.json["result"] == [
        {"alias": "fast", "is_default": False},
        {"alias": "gpt-4o", "is_default": True},
    ]


def test_is_default_is_always_present(
    client: Any, full_api_access: None, mocker: MockerFixture
) -> None:
    """The client must never have to tell absent apart from false."""
    mocker.patch("zobi.agent.api.chat_aliases", return_value=["only"])
    mocker.patch("zobi.agent.api.resolve_alias", return_value="only")

    response = client.get("/api/v1/zobi_agent/models/")

    for row in response.json["result"]:
        assert "is_default" in row


def test_no_configured_models_returns_an_empty_list(
    client: Any, full_api_access: None, mocker: MockerFixture
) -> None:
    """A fresh install has no gateway rows, which is not an error."""
    mocker.patch("zobi.agent.api.chat_aliases", return_value=[])
    mocker.patch(
        "zobi.agent.api.resolve_alias",
        side_effect=NoModelForCapabilityError("nothing configured"),
    )

    response = client.get("/api/v1/zobi_agent/models/")

    assert response.status_code == 200
    assert response.json["result"] == []


def test_models_without_a_resolvable_default_still_list(
    client: Any, full_api_access: None, mocker: MockerFixture
) -> None:
    """Aliases exist but no default resolves: list them, mark none."""
    mocker.patch("zobi.agent.api.chat_aliases", return_value=["a", "b"])
    mocker.patch(
        "zobi.agent.api.resolve_alias",
        side_effect=NoModelForCapabilityError("nothing configured"),
    )

    response = client.get("/api/v1/zobi_agent/models/")

    assert response.json["result"] == [
        {"alias": "a", "is_default": False},
        {"alias": "b", "is_default": False},
    ]
