import logging
from functools import partial

from sqlalchemy.exc import SQLAlchemyError

from zobi import db
from zobi.commands.dashboard.permalink.base import BaseDashboardPermalinkCommand
from zobi.daos.dashboard import DashboardDAO
from zobi.daos.key_value import KeyValueDAO
from zobi.dashboards.permalink.exceptions import DashboardPermalinkCreateFailedError
from zobi.dashboards.permalink.types import DashboardPermalinkState
from zobi.key_value.exceptions import (
    KeyValueCodecEncodeException,
    KeyValueUpsertFailedError,
)
from zobi.key_value.utils import (
    encode_permalink_key,
    get_deterministic_uuid,
    get_deterministic_uuid_with_algorithm,
    get_fallback_algorithms,
)
from zobi.utils.core import get_user_id
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class CreateDashboardPermalinkCommand(BaseDashboardPermalinkCommand):
    """
    Get or create a permalink key for the dashboard.

    The same dashboard_id and state for the same user will return the
    same permalink.
    """

    def __init__(
        self,
        dashboard_id: str,
        state: DashboardPermalinkState,
    ):
        self.dashboard_id = dashboard_id
        self.state = state

    @transaction(
        on_error=partial(
            on_error,
            catches=(
                KeyValueCodecEncodeException,
                KeyValueUpsertFailedError,
                SQLAlchemyError,
            ),
            reraise=DashboardPermalinkCreateFailedError,
        ),
    )
    def run(self) -> str:
        self.validate()
        dashboard = DashboardDAO.get_by_id_or_slug(self.dashboard_id)
        value = {
            "dashboardId": str(dashboard.uuid),
            "state": self.state,
        }
        user_id = get_user_id()
        payload = (user_id, value)

        # Try to find existing entry with current algorithm
        uuid_key = get_deterministic_uuid(self.salt, payload)
        entry = KeyValueDAO.get_entry(self.resource, uuid_key)

        # Fallback: check configured fallback algorithms for backward compatibility
        if not entry:
            for fallback_algo in get_fallback_algorithms():
                uuid_fallback = get_deterministic_uuid_with_algorithm(
                    self.salt, payload, fallback_algo
                )
                entry = KeyValueDAO.get_entry(self.resource, uuid_fallback)
                if entry:
                    break

        if entry:
            # Return existing entry
            assert entry.id  # for type checks
            return encode_permalink_key(key=entry.id, salt=self.salt)

        # Create new entry with current algorithm
        entry = KeyValueDAO.create_entry(
            resource=self.resource,
            key=uuid_key,
            value=value,
            codec=self.codec,
        )
        db.session.flush()
        assert entry.id  # for type checks
        return encode_permalink_key(key=entry.id, salt=self.salt)

    def validate(self) -> None:
        pass
