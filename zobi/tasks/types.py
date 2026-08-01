from __future__ import annotations

from typing import NamedTuple

from zobi.utils.backports import StrEnum


class FixedExecutor(NamedTuple):
    username: str


class ExecutorType(StrEnum):
    """
    Which user should async tasks be executed as. Used as follows:
    For Alerts & Reports: the "model" refers to the AlertSchedule object
    For Thumbnails: The "model" refers to the Slice or Dashboard object
    """

    # A fixed user account. Note that for assigning a fixed user you should use the
    # FixedExecutor class.
    FIXED_USER = "fixed_user"
    # The creator of the model
    CREATOR = "creator"
    # The creator of the model, if found in the owners list
    CREATOR_OWNER = "creator_owner"
    # The currently logged in user. In the case of Alerts & Reports, this is always
    # None. For Thumbnails, this is the user that requested the thumbnail
    CURRENT_USER = "current_user"
    # The last modifier of the model
    MODIFIER = "modifier"
    # The last modifier of the model, if found in the owners list
    MODIFIER_OWNER = "modifier_owner"
    # An owner of the model. If the last modifier is in the owners list, returns that
    # user. If the modifier is not found, returns the creator if found in the owners
    # list. Finally, if neither are present, returns the first user in the owners list.
    OWNER = "owner"


Executor = FixedExecutor | ExecutorType


# Alias type to represent the executor that was chosen from a list of Executors
ChosenExecutor = tuple[ExecutorType, str]
