from unittest.mock import MagicMock, patch

from flask_appbuilder.security.sqla.models import Group, Role, User

from zobi.security.manager import (
    _log_audit_event,
    ZobiGroupApi,
    ZobiRoleApi,
    ZobiSecurityManager,
    ZobiUserApi,
)


@patch("zobi.extensions.event_logger")
@patch("zobi.security.manager.get_user_id", return_value=1)
def test_log_audit_event_calls_event_logger(
    mock_get_user_id: MagicMock,
    mock_event_logger: MagicMock,
) -> None:
    """_log_audit_event delegates to the configured event_logger."""
    _log_audit_event("TestAction", {"key": "value"})

    mock_event_logger.log.assert_called_once_with(
        user_id=1,
        action="TestAction",
        dashboard_id=None,
        duration_ms=None,
        slice_id=None,
        referrer=None,
        curated_payload=None,
        curated_form_data=None,
        records=[{"key": "value"}],
    )


@patch("zobi.extensions.event_logger")
@patch("zobi.security.manager.get_user_id", return_value=1)
def test_log_audit_event_handles_logger_error(
    mock_get_user_id: MagicMock,
    mock_event_logger: MagicMock,
) -> None:
    """_log_audit_event does not raise on event_logger errors."""
    mock_event_logger.log.side_effect = Exception("Logger error")
    # Should not raise
    _log_audit_event("TestAction", {"key": "value"})


# --- Role CRUD ---


@patch("zobi.security.manager._log_audit_event")
def test_role_api_post_add_logs_event(mock_log: MagicMock) -> None:
    """ZobiRoleApi.post_add logs a RoleCreated event."""
    api = ZobiRoleApi.__new__(ZobiRoleApi)
    role = MagicMock(spec=Role)
    role.name = "TestRole"
    role.id = 42
    api.post_add(role)
    mock_log.assert_called_once_with(
        "RoleCreated", {"role_name": "TestRole", "role_id": 42}
    )


@patch("zobi.security.manager._log_audit_event")
def test_role_api_post_update_logs_event(mock_log: MagicMock) -> None:
    """ZobiRoleApi.post_update logs a RoleUpdated event."""
    api = ZobiRoleApi.__new__(ZobiRoleApi)
    role = MagicMock(spec=Role)
    role.name = "TestRole"
    role.id = 42
    api.post_update(role)
    mock_log.assert_called_once_with(
        "RoleUpdated", {"role_name": "TestRole", "role_id": 42}
    )


@patch("zobi.security.manager._log_audit_event")
def test_role_api_post_delete_logs_event(mock_log: MagicMock) -> None:
    """ZobiRoleApi.post_delete logs a RoleDeleted event."""
    api = ZobiRoleApi.__new__(ZobiRoleApi)
    role = MagicMock(spec=Role)
    role.name = "TestRole"
    role.id = 42
    api.post_delete(role)
    mock_log.assert_called_once_with(
        "RoleDeleted", {"role_name": "TestRole", "role_id": 42}
    )


# --- User CRUD ---


@patch("zobi.security.manager._log_audit_event")
def test_user_api_post_add_logs_event(mock_log: MagicMock) -> None:
    """ZobiUserApi.post_add logs a UserCreated event."""
    api = ZobiUserApi.__new__(ZobiUserApi)
    user = MagicMock(spec=User)
    user.username = "testuser"
    user.id = 7
    user.email = "test@example.com"
    api.post_add(user)
    mock_log.assert_called_once_with(
        "UserCreated",
        {
            "target_username": "testuser",
            "target_user_id": 7,
            "email": "test@example.com",
        },
    )


@patch("zobi.security.manager._log_audit_event")
def test_user_api_post_update_logs_event(mock_log: MagicMock) -> None:
    """ZobiUserApi.post_update logs a UserUpdated event."""
    api = ZobiUserApi.__new__(ZobiUserApi)
    user = MagicMock(spec=User)
    user.username = "testuser"
    user.id = 7
    user.email = "test@example.com"
    user.active = True
    api.post_update(user)
    mock_log.assert_called_once_with(
        "UserUpdated",
        {
            "target_username": "testuser",
            "target_user_id": 7,
            "email": "test@example.com",
            "active": True,
        },
    )


@patch("zobi.security.manager._log_audit_event")
def test_user_api_post_delete_logs_event(mock_log: MagicMock) -> None:
    """ZobiUserApi.post_delete logs a UserDeleted event."""
    api = ZobiUserApi.__new__(ZobiUserApi)
    user = MagicMock(spec=User)
    user.username = "testuser"
    user.id = 7
    api.post_delete(user)
    mock_log.assert_called_once_with(
        "UserDeleted",
        {"target_username": "testuser", "target_user_id": 7},
    )


# --- Group CRUD ---


@patch("zobi.security.manager._log_audit_event")
def test_group_api_post_add_logs_event(mock_log: MagicMock) -> None:
    """ZobiGroupApi.post_add logs a GroupCreated event."""
    api = ZobiGroupApi.__new__(ZobiGroupApi)
    group = MagicMock(spec=Group)
    group.name = "TestGroup"
    group.id = 10
    api.post_add(group)
    mock_log.assert_called_once_with(
        "GroupCreated", {"group_name": "TestGroup", "group_id": 10}
    )


@patch("zobi.security.manager._log_audit_event")
def test_group_api_post_update_logs_event(mock_log: MagicMock) -> None:
    """ZobiGroupApi.post_update logs a GroupUpdated event."""
    api = ZobiGroupApi.__new__(ZobiGroupApi)
    group = MagicMock(spec=Group)
    group.name = "TestGroup"
    group.id = 10
    api.post_update(group)
    mock_log.assert_called_once_with(
        "GroupUpdated", {"group_name": "TestGroup", "group_id": 10}
    )


@patch("zobi.security.manager._log_audit_event")
def test_group_api_post_delete_logs_event(mock_log: MagicMock) -> None:
    """ZobiGroupApi.post_delete logs a GroupDeleted event."""
    api = ZobiGroupApi.__new__(ZobiGroupApi)
    group = MagicMock(spec=Group)
    group.name = "TestGroup"
    group.id = 10
    api.post_delete(group)
    mock_log.assert_called_once_with(
        "GroupDeleted", {"group_name": "TestGroup", "group_id": 10}
    )


# --- Login / Logout ---


@patch("zobi.security.manager._log_audit_event")
def test_on_user_login_logs_event(mock_log: MagicMock) -> None:
    """on_user_login logs a UserLoggedIn event."""
    sm = ZobiSecurityManager.__new__(ZobiSecurityManager)
    user = MagicMock(spec=User)
    user.username = "testuser"
    user.id = 7

    sm.on_user_login(user)

    mock_log.assert_called_once_with(
        "UserLoggedIn", {"username": "testuser", "user_id": 7}
    )


@patch("zobi.security.manager._log_audit_event")
def test_on_user_login_failed_logs_event(mock_log: MagicMock) -> None:
    """on_user_login_failed logs a UserLoginFailed event."""
    sm = ZobiSecurityManager.__new__(ZobiSecurityManager)
    user = MagicMock(spec=User)
    user.username = "testuser"
    user.id = 7

    sm.on_user_login_failed(user)

    mock_log.assert_called_once_with(
        "UserLoginFailed", {"username": "testuser", "user_id": 7}
    )


@patch("zobi.security.manager._log_audit_event")
def test_on_user_logout_logs_event(mock_log: MagicMock) -> None:
    """on_user_logout logs a UserLoggedOut event."""
    sm = ZobiSecurityManager.__new__(ZobiSecurityManager)
    user = MagicMock(spec=User)
    user.username = "testuser"
    user.id = 7

    sm.on_user_logout(user)

    mock_log.assert_called_once_with(
        "UserLoggedOut", {"username": "testuser", "user_id": 7}
    )
