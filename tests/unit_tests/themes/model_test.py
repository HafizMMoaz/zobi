

from zobi.models.core import Theme


class TestThemeModel:
    """Unit tests for Theme model"""

    def test_theme_model_attributes(self):
        """Test that Theme model has correct attributes"""
        assert hasattr(Theme, "id")
        assert hasattr(Theme, "theme_name")
        assert hasattr(Theme, "json_data")
        assert hasattr(Theme, "uuid")  # from UUIDMixin
        assert hasattr(Theme, "created_by_fk")  # from AuditMixinNullable
        assert hasattr(Theme, "changed_by_fk")  # from AuditMixinNullable
        assert hasattr(Theme, "created_on")  # from AuditMixinNullable
        assert hasattr(Theme, "changed_on")  # from AuditMixinNullable

    def test_theme_model_tablename(self):
        """Test that Theme model has correct table name"""
        assert Theme.__tablename__ == "themes"

    def test_theme_model_docstring(self):
        """Test that Theme model has correct docstring"""
        assert Theme.__doc__ == "Themes for dashboards"

    def test_theme_model_inheritance(self):
        """Test that Theme model inherits from correct mixins"""
        from flask_appbuilder import Model

        from zobi.models.helpers import AuditMixinNullable, UUIDMixin

        # Check that Theme inherits from the expected classes
        assert issubclass(Theme, AuditMixinNullable)
        assert issubclass(Theme, UUIDMixin)
        assert issubclass(Theme, Model)
