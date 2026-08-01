from typing import Optional, TypedDict, Union

from flask_appbuilder.security.sqla.models import Group, Role
from flask_login import AnonymousUserMixin

from zobi.utils.backports import StrEnum


class GuestTokenUser(TypedDict, total=False):
    username: str
    first_name: str
    last_name: str


class GuestTokenResourceType(StrEnum):
    DASHBOARD = "dashboard"


class GuestTokenResource(TypedDict):
    type: GuestTokenResourceType
    id: Union[str, int]


GuestTokenResources = list[GuestTokenResource]


class GuestTokenRlsRule(TypedDict):
    dataset: Optional[str]
    clause: str


class GuestToken(TypedDict):
    iat: float
    exp: float
    user: GuestTokenUser
    resources: GuestTokenResources
    rls_rules: list[GuestTokenRlsRule]


class GuestUser(AnonymousUserMixin):
    """
    Used as the "anonymous" user in case of guest authentication (embedded)
    """

    is_guest_user = True
    # FAB 5.0 renamed active to is_active, keeping both for backwards compatibility
    active = is_active = True

    @property
    def is_authenticated(self) -> bool:
        """
        This is set to true because guest users should be considered authenticated,
        at least in most places. The treatment of this flag is kind of inconsistent.
        """
        return True

    @property
    def is_anonymous(self) -> bool:
        """
        This is set to false because lots of code assumes that
        if user.is_anonymous, then role = Public
        But guest users need to have their own role independent of Public.
        """
        return False

    def __init__(self, token: GuestToken, roles: list[Role]):
        user = token["user"]
        self.guest_token = token
        self.username = user.get("username", "guest_user")
        self.first_name = user.get("first_name", "Guest")
        self.last_name = user.get("last_name", "User")
        self.roles = roles
        self.groups: list[Group] = []  # Guest users don't belong to any groups
        self.resources = token["resources"]
        self.rls = token.get("rls_rules", [])
