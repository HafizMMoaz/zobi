"""Tests for system-level utility functions."""

from unittest.mock import MagicMock, patch

from zobi.mcp_service.system.system_utils import calculate_feature_availability


def test_calculate_feature_availability_returns_menus():
    """Test that accessible menus are returned."""
    mock_sm = MagicMock()
    mock_sm.user_view_menu_names.return_value = {
        "SQL Lab",
        "Dashboards",
        "Charts",
    }

    with patch("zobi.security_manager", mock_sm):
        result = calculate_feature_availability({}, {}, {})

    assert result.accessible_menus == ["Charts", "Dashboards", "SQL Lab"]
    mock_sm.user_view_menu_names.assert_called_once_with("menu_access")


def test_calculate_feature_availability_empty_when_no_context():
    """Test graceful fallback when security manager is unavailable."""
    broken_sm = MagicMock()
    broken_sm.user_view_menu_names.side_effect = RuntimeError("no ctx")

    with patch("zobi.security_manager", broken_sm):
        result = calculate_feature_availability({}, {}, {})

    assert result.accessible_menus == []


def test_calculate_feature_availability_menus_sorted():
    """Test that accessible menus are returned in sorted order."""
    mock_sm = MagicMock()
    mock_sm.user_view_menu_names.return_value = {"Zzz", "Aaa", "Mmm"}

    with patch("zobi.security_manager", mock_sm):
        result = calculate_feature_availability({}, {}, {})

    assert result.accessible_menus == ["Aaa", "Mmm", "Zzz"]
