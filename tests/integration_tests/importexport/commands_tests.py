from unittest.mock import patch

import yaml
from freezegun import freeze_time

from tests.integration_tests.base_tests import ZobiTestCase
from zobi import security_manager
from zobi.commands.database.export import ExportDatabasesCommand
from zobi.utils.database import get_example_database


class TestExportModelsCommand(ZobiTestCase):
    @patch("zobi.security.manager.g")
    def test_export_models_command(self, mock_g):
        """Make sure metadata.yaml has the correct content."""
        mock_g.user = security_manager.find_user("admin")

        example_db = get_example_database()

        with freeze_time("2020-01-01T00:00:00Z"):
            command = ExportDatabasesCommand([example_db.id])
            contents = dict(command.run())

        metadata = yaml.safe_load(contents["metadata.yaml"]())
        assert metadata == (
            {
                "version": "1.0.0",
                "type": "Database",
                "timestamp": "2020-01-01T00:00:00+00:00",
            }
        )
