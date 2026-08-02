from unittest.mock import MagicMock, patch

from zobi.security.manager import ZobiSecurityManager


def test_granular_export_permissions_registered_in_create_custom_permissions(
    app_context: None,
) -> None:
    """Verify that create_custom_permissions registers all granular export perms."""
    from zobi.extensions import appbuilder

    sm = ZobiSecurityManager(appbuilder)
    sm.add_permission_view_menu = MagicMock()

    sm.create_custom_permissions()

    calls = [
        (call.args[0], call.args[1])
        for call in sm.add_permission_view_menu.call_args_list
    ]
    assert ("can_export_data", "Zobi") in calls
    assert ("can_export_image", "Zobi") in calls
    assert ("can_copy_clipboard", "Zobi") in calls


def test_sqllab_extra_permission_views_include_export_perms() -> None:
    """Verify SQLLAB_EXTRA_PERMISSION_VIEWS includes granular export perms."""
    assert ("can_export_data", "Zobi") in (
        ZobiSecurityManager.SQLLAB_EXTRA_PERMISSION_VIEWS
    )
    assert ("can_copy_clipboard", "Zobi") in (
        ZobiSecurityManager.SQLLAB_EXTRA_PERMISSION_VIEWS
    )


def test_gamma_excluded_pvms_excludes_export_data_and_image() -> None:
    """Verify GAMMA_EXCLUDED_PVMS excludes can_export_data and can_export_image."""
    assert ("can_export_data", "Zobi") in (ZobiSecurityManager.GAMMA_EXCLUDED_PVMS)
    assert ("can_export_image", "Zobi") in (ZobiSecurityManager.GAMMA_EXCLUDED_PVMS)


def test_gamma_excluded_pvms_allows_copy_clipboard() -> None:
    """Verify GAMMA_EXCLUDED_PVMS does NOT exclude can_copy_clipboard."""
    assert ("can_copy_clipboard", "Zobi") not in (
        ZobiSecurityManager.GAMMA_EXCLUDED_PVMS
    )


def test_is_gamma_pvm_excludes_export_data(app_context: None) -> None:
    """Verify _is_gamma_pvm returns False for can_export_data."""
    from zobi.extensions import appbuilder

    sm = ZobiSecurityManager(appbuilder)
    pvm = MagicMock()
    pvm.permission.name = "can_export_data"
    pvm.view_menu.name = "Zobi"

    assert sm._is_gamma_pvm(pvm) is False


def test_is_gamma_pvm_excludes_export_image(app_context: None) -> None:
    """Verify _is_gamma_pvm returns False for can_export_image."""
    from zobi.extensions import appbuilder

    sm = ZobiSecurityManager(appbuilder)
    pvm = MagicMock()
    pvm.permission.name = "can_export_image"
    pvm.view_menu.name = "Zobi"

    assert sm._is_gamma_pvm(pvm) is False


def test_is_gamma_pvm_allows_copy_clipboard(app_context: None) -> None:
    """Verify _is_gamma_pvm returns True for can_copy_clipboard."""
    from zobi.extensions import appbuilder

    sm = ZobiSecurityManager(appbuilder)
    pvm = MagicMock()
    pvm.permission.name = "can_copy_clipboard"
    pvm.view_menu.name = "Zobi"
    # Ensure the pvm doesn't trigger other exclusion checks
    with (
        patch.object(sm, "_is_user_defined_permission", return_value=False),
        patch.object(sm, "_is_admin_only", return_value=False),
        patch.object(sm, "_is_alpha_only", return_value=False),
        patch.object(sm, "_is_sql_lab_only", return_value=False),
        patch.object(sm, "_is_accessible_to_all", return_value=False),
    ):
        assert sm._is_gamma_pvm(pvm) is True
