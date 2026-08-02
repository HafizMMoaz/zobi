from unittest.mock import Mock, patch

import pytest

from tests.conftest import with_config
from zobi.commands.theme.exceptions import (
    SystemThemeProtectedError,
    ThemeNotFoundError,
)
from zobi.commands.theme.seed import SeedSystemThemesCommand
from zobi.commands.theme.update import UpdateThemeCommand
from zobi.models.core import Theme


class TestUpdateThemeCommand:
    """Unit tests for UpdateThemeCommand"""

    @patch("zobi.commands.theme.update.ThemeDAO")
    def test_validate_theme_not_found(self, mock_theme_dao):
        """Test validation fails when theme doesn't exist"""
        # Arrange
        mock_theme_dao.find_by_id.return_value = None
        command = UpdateThemeCommand(123, {"theme_name": "test"})

        # Act & Assert
        with pytest.raises(ThemeNotFoundError):
            command.validate()

    @patch("zobi.commands.theme.update.ThemeDAO")
    def test_validate_system_theme_protection(self, mock_theme_dao):
        """Test validation fails when trying to update system theme"""
        # Arrange
        mock_theme = Mock(spec=Theme)
        mock_theme.is_system = True
        mock_theme_dao.find_by_id.return_value = mock_theme
        command = UpdateThemeCommand(123, {"theme_name": "test"})

        # Act & Assert
        with pytest.raises(SystemThemeProtectedError):
            command.validate()

    @patch("zobi.commands.theme.update.ThemeDAO")
    def test_validate_regular_theme_success(self, mock_theme_dao):
        """Test validation succeeds for regular (non-system) themes"""
        # Arrange
        mock_theme = Mock(spec=Theme)
        mock_theme.is_system = False
        mock_theme_dao.find_by_id.return_value = mock_theme
        command = UpdateThemeCommand(123, {"theme_name": "test"})

        # Act
        command.validate()  # Should not raise any exception

        # Assert
        assert command._model == mock_theme

    @patch("zobi.commands.theme.update.ThemeDAO")
    def test_run_success(self, mock_theme_dao):
        """Test successful theme update"""
        # Arrange
        mock_theme = Mock(spec=Theme)
        mock_theme.is_system = False
        mock_updated_theme = Mock(spec=Theme)
        mock_theme_dao.find_by_id.return_value = mock_theme
        mock_theme_dao.update.return_value = mock_updated_theme

        command = UpdateThemeCommand(123, {"theme_name": "updated_name"})

        # Act
        result = command.run()

        # Assert
        assert result == mock_updated_theme
        mock_theme_dao.update.assert_called_once_with(
            mock_theme, {"theme_name": "updated_name"}
        )


class TestSeedSystemThemesCommand:
    """Unit tests for SeedSystemThemesCommand"""

    @with_config(
        {
            "THEME_DEFAULT": None,
            "THEME_DARK": None,
        }
    )
    def test_run_no_themes_configured(self, app):
        """Test run when no themes are configured"""
        # Arrange
        command = SeedSystemThemesCommand()

        # Act
        command.run()  # Should complete without error

    @with_config(
        {
            "THEME_DEFAULT": {"algorithm": "default", "token": {}},
            "THEME_DARK": None,
        }
    )
    @patch("zobi.commands.theme.seed.db")
    def test_run_with_theme_default_only(self, mock_db, app):
        """Test run when only THEME_DEFAULT is configured"""
        # Arrange
        mock_session = Mock()
        mock_db.session = mock_session
        mock_session.query.return_value.filter.return_value.first.return_value = None

        command = SeedSystemThemesCommand()

        # Act
        command.run()

        # Assert
        mock_session.add.assert_called_once()
        # Note: commit is handled by @transaction() decorator, not directly called

    @with_config(
        {
            "THEME_DEFAULT": {"algorithm": "default", "token": {}},
            "THEME_DARK": None,
        }
    )
    @patch("zobi.commands.theme.seed.db")
    def test_run_update_existing_theme(self, mock_db, app):
        """Test run when theme already exists and needs updating"""
        # Arrange
        # Mock existing theme
        mock_existing_theme = Mock(spec=Theme)
        mock_existing_theme.json_data = '{"old": "data"}'

        mock_session = Mock()
        mock_db.session = mock_session
        mock_session.query.return_value.filter.return_value.first.return_value = (
            mock_existing_theme
        )

        command = SeedSystemThemesCommand()

        # Act
        command.run()

        # Assert
        assert '"algorithm": "default"' in mock_existing_theme.json_data
        # Note: commit is handled by @transaction() decorator, not directly called
        mock_session.add.assert_not_called()  # Should not add new theme

    @with_config(
        {
            "THEME_DEFAULT": {"algorithm": "default", "token": {}},
            "THEME_DARK": None,
        }
    )
    @patch("zobi.commands.theme.seed.db")
    @patch("zobi.commands.theme.seed.logger")
    def test_run_handles_database_error(self, mock_logger, mock_db, app):
        """Test run handles database errors gracefully"""
        # Arrange
        mock_session = Mock()
        mock_db.session = mock_session
        mock_session.query.side_effect = Exception("Database error")

        command = SeedSystemThemesCommand()

        # Act & Assert
        with pytest.raises(Exception, match="Database error"):
            command.run()  # Should raise exception due to @transaction() decorator

    @with_config(
        {
            "THEME_DEFAULT": {"algorithm": "default", "token": {}},
            "THEME_DARK": {"algorithm": "dark", "token": {}},
        }
    )
    @patch("zobi.commands.theme.seed.db")
    def test_run_with_both_themes(self, mock_db, app):
        """Test run when both THEME_DEFAULT and THEME_DARK are configured"""
        # Arrange
        mock_session = Mock()
        mock_db.session = mock_session
        mock_session.query.return_value.filter.return_value.first.return_value = None

        command = SeedSystemThemesCommand()

        # Act
        command.run()

        # Assert
        assert mock_session.add.call_count == 2  # Both themes should be added
        # Note: commit is handled by @transaction() decorator, not directly called

    def test_validate(self):
        """Test validate method (should be no-op)"""
        # Arrange
        command = SeedSystemThemesCommand()

        # Act & Assert
        command.validate()  # Should complete without error
