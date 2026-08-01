
from unittest.mock import Mock, patch

from zobi.daos.theme import ThemeDAO
from zobi.models.core import Theme


class TestThemeDAO:
    """Unit tests for ThemeDAO class"""

    @patch("zobi.daos.theme.db")
    def test_find_by_uuid_exists(self, mock_db):
        """Test finding a theme by UUID when it exists"""
        # Arrange
        mock_theme = Mock(spec=Theme)
        mock_theme.uuid = "test-uuid-123"
        mock_query = mock_db.session.query.return_value
        mock_query.filter.return_value.first.return_value = mock_theme

        # Act
        result = ThemeDAO.find_by_uuid("test-uuid-123")

        # Assert
        assert result == mock_theme
        mock_db.session.query.assert_called_once_with(Theme)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()

    @patch("zobi.daos.theme.db")
    def test_find_by_uuid_not_exists(self, mock_db):
        """Test finding a theme by UUID when it doesn't exist"""
        # Arrange
        mock_query = mock_db.session.query.return_value
        mock_query.filter.return_value.first.return_value = None

        # Act
        result = ThemeDAO.find_by_uuid("nonexistent-uuid")

        # Assert
        assert result is None
