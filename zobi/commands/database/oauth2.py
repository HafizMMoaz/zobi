
from datetime import datetime, timedelta
from functools import partial
from typing import cast
from uuid import UUID

from zobi.commands.base import BaseCommand
from zobi.commands.database.exceptions import DatabaseNotFoundError
from zobi.daos.database import DatabaseUserOAuth2TokensDAO
from zobi.daos.key_value import KeyValueDAO
from zobi.databases.schemas import OAuth2ProviderResponseSchema
from zobi.exceptions import OAuth2Error
from zobi.key_value.types import JsonKeyValueCodec, KeyValueResource
from zobi.models.core import Database, DatabaseUserOAuth2Tokens
from zobi.zobi_typing import OAuth2State
from zobi.utils.decorators import on_error, transaction
from zobi.utils.oauth2 import decode_oauth2_state


class OAuth2StoreTokenCommand(BaseCommand):
    """
    Command to store OAuth2 tokens in the database.
    """

    def __init__(self, parameters: OAuth2ProviderResponseSchema):
        self._parameters = parameters
        self._state: OAuth2State | None = None
        self._database: Database | None = None

    @transaction(on_error=partial(on_error, reraise=OAuth2Error))
    def run(self) -> DatabaseUserOAuth2Tokens:
        self.validate()
        self._database = cast(Database, self._database)
        self._state = cast(OAuth2State, self._state)

        oauth2_config = self._database.get_oauth2_config()
        if oauth2_config is None:
            raise OAuth2Error("No configuration found for OAuth2")

        # Look up PKCE code_verifier from KV store (RFC 7636)
        code_verifier = None
        tab_id = self._state["tab_id"]
        try:
            tab_uuid = UUID(tab_id)
        except ValueError:
            tab_uuid = None

        if tab_uuid:
            kv_value = KeyValueDAO.get_value(
                resource=KeyValueResource.PKCE_CODE_VERIFIER,
                key=tab_uuid,
                codec=JsonKeyValueCodec(),
            )
            if kv_value:
                code_verifier = kv_value.get("code_verifier")
                KeyValueDAO.delete_entry(KeyValueResource.PKCE_CODE_VERIFIER, tab_uuid)

        token_response = self._database.db_engine_spec.get_oauth2_token(
            oauth2_config,
            self._parameters["code"],
            code_verifier=code_verifier,
        )

        # delete old tokens
        if existing := DatabaseUserOAuth2TokensDAO.find_one_or_none(
            user_id=self._state["user_id"],
            database_id=self._state["database_id"],
        ):
            DatabaseUserOAuth2TokensDAO.delete([existing])

        # store tokens
        expiration = datetime.now() + timedelta(seconds=token_response["expires_in"])
        return DatabaseUserOAuth2TokensDAO.create(
            attributes={
                "user_id": self._state["user_id"],
                "database_id": self._state["database_id"],
                "access_token": token_response["access_token"],
                "access_token_expiration": expiration,
                "refresh_token": token_response.get("refresh_token"),
            },
        )

    def validate(self) -> None:
        if error := self._parameters.get("error"):
            raise OAuth2Error(error)

        self._state = decode_oauth2_state(self._parameters["state"])

        if database := DatabaseUserOAuth2TokensDAO.get_database(
            self._state["database_id"]
        ):
            self._database = database
        else:
            raise DatabaseNotFoundError("Database not found")
