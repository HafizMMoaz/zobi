"""End-to-end HTTP tests for the gateway API.

Unlike the other API tests in this repo, these do not mock the command layer:
they drive real requests against a real (in-memory) database so the full path -
schema, command, param splitting, encryption column, masking - is exercised.
That is the only way to prove the secret round-trip actually holds over HTTP.
"""

from typing import Any

import pytest
from sqlalchemy.orm.session import Session

from zobi.constants import PASSWORD_MASK
from zobi.daos.llm import LLMProviderDAO
from zobi.llm import router as router_module
from zobi.models.llm import LLMProvider

ZOBI_AI_APP = pytest.mark.parametrize(
    "app",
    [{"FEATURE_FLAGS": {"ZOBI_AI": True}}],
    indirect=True,
)


@pytest.fixture
def llm_tables(session: Session) -> Any:
    """Point both the ORM and FAB's data models at the in-memory database.

    ``conftest``'s ``session`` fixture patches ``zobi.db.session``, which the
    commands use, but FAB's ``SQLAInterface`` holds its own session reference
    captured at import time. Without redirecting it too, writes land in one
    database and list requests read from another.
    """
    from zobi.llm.api import LLMModelRestApi, LLMProviderRestApi  # noqa: PLC0415

    LLMProvider.metadata.create_all(session.get_bind())
    router_module.clear_router_cache()

    # `session` is a read-only property that falls back to the appbuilder
    # session; `_session` is the override it checks first.
    datamodels = [LLMProviderRestApi.datamodel, LLMModelRestApi.datamodel]
    originals = [datamodel._session for datamodel in datamodels]  # noqa: SLF001
    for datamodel in datamodels:
        datamodel._session = session  # noqa: SLF001

    yield session

    for datamodel, original in zip(datamodels, originals, strict=True):
        datamodel._session = original  # noqa: SLF001


def _create_provider(client: Any, name: str = "OpenAI prod") -> int:
    response = client.post(
        "/api/v1/llm_provider/",
        json={
            "name": name,
            "provider_key": "openai",
            "params": {
                "api_key": "sk-real-secret-value",
                "api_base": "https://api.openai.com/v1",
            },
        },
    )
    assert response.status_code == 201, response.json
    return response.json["id"]


@ZOBI_AI_APP
def test_available_lists_every_provider_preset(
    client: Any,
    full_api_access: None,
) -> None:
    """The endpoint the credential form renders itself from."""
    response = client.get("/api/v1/llm_provider/available/")

    assert response.status_code == 200
    keys = {entry["key"] for entry in response.json["result"]}
    assert {"openai", "anthropic", "openrouter", "bedrock", "vertex_ai"} <= keys

    bedrock = next(e for e in response.json["result"] if e["key"] == "bedrock")
    secret_fields = {f["name"] for f in bedrock["fields"] if f["secret"]}
    assert secret_fields == {
        "aws_access_key_id",
        "aws_secret_access_key",
        "aws_session_token",
    }


@ZOBI_AI_APP
def test_create_provider_then_list_never_returns_the_secret(
    client: Any,
    full_api_access: None,
    llm_tables: Session,
) -> None:
    """The invariant, asserted over the wire."""
    _create_provider(client)

    response = client.get("/api/v1/llm_provider/")

    assert response.status_code == 200
    [result] = response.json["result"]
    assert result["public_params"]["api_key"] == PASSWORD_MASK
    assert result["public_params"]["api_base"] == "https://api.openai.com/v1"
    # Belt and braces: the raw secret must not appear anywhere in the payload.
    assert "sk-real-secret-value" not in response.get_data(as_text=True)


@ZOBI_AI_APP
def test_secret_survives_a_save_that_does_not_retype_it(
    client: Any,
    full_api_access: None,
    llm_tables: Session,
) -> None:
    """Reload the form, change something else, save: the key must still work."""
    provider_id = _create_provider(client)

    response = client.put(
        f"/api/v1/llm_provider/{provider_id}",
        json={
            "params": {
                "api_key": PASSWORD_MASK,
                "api_base": "https://proxy.internal/v1",
            }
        },
    )

    assert response.status_code == 200
    provider = LLMProviderDAO.find_by_id(provider_id)
    assert provider is not None
    assert provider.encrypted_params_dict["api_key"] == "sk-real-secret-value"
    assert provider.params_dict["api_base"] == "https://proxy.internal/v1"


@ZOBI_AI_APP
def test_create_provider_rejects_missing_required_credentials(
    client: Any,
    full_api_access: None,
    llm_tables: Session,
) -> None:
    response = client.post(
        "/api/v1/llm_provider/",
        json={"name": "Bedrock", "provider_key": "bedrock", "params": {}},
    )

    assert response.status_code == 400
    assert "params" in response.json["message"]


@ZOBI_AI_APP
def test_duplicate_provider_name_is_rejected(
    client: Any,
    full_api_access: None,
    llm_tables: Session,
) -> None:
    _create_provider(client, name="Duplicate")

    response = client.post(
        "/api/v1/llm_provider/",
        json={
            "name": "Duplicate",
            "provider_key": "openai",
            "params": {"api_key": "sk-other"},
        },
    )

    assert response.status_code == 422


@ZOBI_AI_APP
def test_model_creation_qualifies_a_bare_model_string(
    client: Any,
    full_api_access: None,
    llm_tables: Session,
) -> None:
    """Pasting "gpt-4o" from the vendor docs must still produce a valid model."""
    provider_id = _create_provider(client)

    response = client.post(
        "/api/v1/llm_model/",
        json={
            "provider_id": provider_id,
            "alias": "default-chat",
            "model_string": "gpt-4o",
        },
    )

    assert response.status_code == 201, response.json
    listing = client.get("/api/v1/llm_model/")
    [model] = listing.json["result"]
    assert model["model_string"] == "openai/gpt-4o"
    assert model["alias"] == "default-chat"


@ZOBI_AI_APP
def test_model_requires_a_capability(
    client: Any,
    full_api_access: None,
    llm_tables: Session,
) -> None:
    provider_id = _create_provider(client)

    response = client.post(
        "/api/v1/llm_model/",
        json={
            "provider_id": provider_id,
            "alias": "useless",
            "model_string": "gpt-4o",
            "supports_chat": False,
        },
    )

    assert response.status_code == 400


@ZOBI_AI_APP
def test_router_config_round_trips(
    client: Any,
    full_api_access: None,
    llm_tables: Session,
) -> None:
    provider_id = _create_provider(client)
    client.post(
        "/api/v1/llm_model/",
        json={
            "provider_id": provider_id,
            "alias": "primary",
            "model_string": "gpt-4o",
        },
    )
    client.post(
        "/api/v1/llm_model/",
        json={
            "provider_id": provider_id,
            "alias": "backup",
            "model_string": "gpt-4o-mini",
        },
    )

    response = client.put(
        "/api/v1/llm_router_config/",
        json={
            "routing_strategy": "least-busy",
            "num_retries": 3,
            "default_chat_alias": "primary",
            "fallbacks": [{"primary": "primary", "backups": ["backup"]}],
        },
    )

    assert response.status_code == 200, response.json
    config = response.json["result"]
    assert config["routing_strategy"] == "least-busy"
    assert config["default_chat_alias"] == "primary"
    assert config["fallbacks"] == [{"primary": "primary", "backups": ["backup"]}]

    # And it is readable back on a fresh request.
    assert client.get("/api/v1/llm_router_config/").json["result"] == config


@ZOBI_AI_APP
def test_router_config_rejects_an_alias_no_model_serves(
    client: Any,
    full_api_access: None,
    llm_tables: Session,
) -> None:
    """A typo here would otherwise fail only when someone sent a message."""
    response = client.put(
        "/api/v1/llm_router_config/",
        json={"default_chat_alias": "typo-alias"},
    )

    assert response.status_code == 400
    assert "typo-alias" in str(response.json["message"])


@ZOBI_AI_APP
def test_deleting_the_last_model_behind_a_routed_alias_is_blocked(
    client: Any,
    full_api_access: None,
    llm_tables: Session,
) -> None:
    provider_id = _create_provider(client)
    created = client.post(
        "/api/v1/llm_model/",
        json={
            "provider_id": provider_id,
            "alias": "routed",
            "model_string": "gpt-4o",
        },
    )
    model_id = created.json["id"]
    client.put("/api/v1/llm_router_config/", json={"default_chat_alias": "routed"})

    response = client.delete(f"/api/v1/llm_model/{model_id}")

    assert response.status_code == 422


@ZOBI_AI_APP
def test_deleting_one_model_from_a_pool_is_allowed(
    client: Any,
    full_api_access: None,
    llm_tables: Session,
) -> None:
    """Shrinking a load-balanced pool leaves the alias served, so it is safe."""
    provider_id = _create_provider(client)
    first = client.post(
        "/api/v1/llm_model/",
        json={
            "provider_id": provider_id,
            "alias": "pooled",
            "model_string": "gpt-4o",
        },
    )
    client.post(
        "/api/v1/llm_model/",
        json={
            "provider_id": provider_id,
            "alias": "pooled",
            "model_string": "gpt-4o-mini",
        },
    )
    client.put("/api/v1/llm_router_config/", json={"default_chat_alias": "pooled"})

    response = client.delete(f"/api/v1/llm_model/{first.json['id']}")

    assert response.status_code == 200
