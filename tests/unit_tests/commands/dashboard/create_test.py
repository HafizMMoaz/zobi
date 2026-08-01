from __future__ import annotations

import pytest
from flask_appbuilder.security.sqla.models import Role, User
from pytest_mock import MockerFixture

from zobi.commands.dashboard.create import CreateDashboardCommand
from zobi.extensions import security_manager
from tests.unit_tests.fixtures.common import admin_user, after_each  # noqa: F401


def test_validate_custom_role_class(
    mocker: MockerFixture,
    monkeypatch: pytest.MonkeyPatch,
    admin_user: User,  # noqa: F811
    after_each: None,  # noqa: F811
) -> None:
    class CustomRoleModel(Role):
        __tablename__ = "ab_role"

    monkeypatch.setattr(security_manager, "role_model", CustomRoleModel)
    mocker.patch.object(security_manager, "is_admin", return_value=True)

    owner_ids = [admin_user.id]
    role_ids = [role.id for role in admin_user.roles]

    command = CreateDashboardCommand(data={"owners": owner_ids, "roles": role_ids})
    command.validate()

    for role in command._properties["roles"]:
        assert isinstance(role, CustomRoleModel)


def test_validate_custom_user_class(
    mocker: MockerFixture,
    monkeypatch: pytest.MonkeyPatch,
    admin_user: User,  # noqa: F811
    after_each: None,  # noqa: F811
) -> None:
    class CustomUserModel(User):
        __tablename__ = "ab_user"

    monkeypatch.setattr(security_manager, "user_model", CustomUserModel)
    mocker.patch.object(security_manager, "is_admin", return_value=True)

    owner_ids = [admin_user.id]
    role_ids = [role.id for role in admin_user.roles]

    command = CreateDashboardCommand(data={"owners": owner_ids, "roles": role_ids})
    command.validate()

    for owner in command._properties["owners"]:
        assert isinstance(owner, CustomUserModel)


def test_validate_custom_role_and_user_class(
    mocker: MockerFixture,
    monkeypatch: pytest.MonkeyPatch,
    admin_user: User,  # noqa: F811
    after_each: None,  # noqa: F811
) -> None:
    class CustomRoleModel(Role):
        __tablename__ = "ab_role"

    class CustomUserModel(User):
        __tablename__ = "ab_user"

    monkeypatch.setattr(security_manager, "role_model", CustomRoleModel)
    monkeypatch.setattr(security_manager, "user_model", CustomUserModel)
    mocker.patch.object(security_manager, "is_admin", return_value=True)

    owner_ids = [admin_user.id]
    role_ids = [role.id for role in admin_user.roles]

    command = CreateDashboardCommand(data={"owners": owner_ids, "roles": role_ids})
    command.validate()

    for role in command._properties["roles"]:
        assert isinstance(role, CustomRoleModel)

    for owner in command._properties["owners"]:
        assert isinstance(owner, CustomUserModel)
