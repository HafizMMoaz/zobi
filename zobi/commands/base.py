from abc import ABC, abstractmethod
from typing import Any, Optional

from flask_appbuilder.security.sqla.models import User

from zobi.commands.utils import compute_owner_list, populate_owner_list


class BaseCommand(ABC):
    """
    Base class for all Command like Zobi Logic objects
    """

    @abstractmethod
    def run(self) -> Any:
        """
        Run executes the command. Can raise command exceptions
        :raises: CommandException
        """

    @abstractmethod
    def validate(self) -> None:
        """
        Validate is normally called by run to validate data.
        Will raise exception if validation fails
        :raises: CommandException
        """


class CreateMixin:  # pylint: disable=too-few-public-methods
    @staticmethod
    def populate_owners(owner_ids: Optional[list[int]] = None) -> list[User]:
        """
        Populate list of owners, defaulting to the current user if `owner_ids` is
        undefined or empty. If current user is missing in `owner_ids`, current user
        is added unless belonging to the Admin role.

        :param owner_ids: list of owners by id's
        :raises OwnersNotFoundValidationError: if at least one owner can't be resolved
        :returns: Final list of owners
        """
        return populate_owner_list(owner_ids, default_to_user=True)


class UpdateMixin:
    @staticmethod
    def populate_owners(owner_ids: Optional[list[int]] = None) -> list[User]:
        """
        Populate list of owners. If current user is missing in `owner_ids`, current user
        is added unless belonging to the Admin role.

        :param owner_ids: list of owners by id's
        :raises OwnersNotFoundValidationError: if at least one owner can't be resolved
        :returns: Final list of owners
        """
        return populate_owner_list(owner_ids, default_to_user=False)

    @staticmethod
    def compute_owners(
        current_owners: Optional[list[User]],
        new_owners: Optional[list[int]],
    ) -> list[User]:
        """
        Handle list of owners for update events.

        :param current_owners: list of current owners
        :param new_owners: list of new owners specified in the update payload
        :returns: Final list of owners
        """
        return compute_owner_list(current_owners, new_owners)
