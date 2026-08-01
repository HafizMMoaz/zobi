
from unittest.mock import patch

from zobi.semantic_layers import labels


def test_labels_feature_flag_off() -> None:
    with patch(
        "zobi.feature_flag_manager.is_feature_enabled",
        return_value=False,
    ):
        assert labels.dataset_label() == "Dataset"
        assert labels.dataset_label_lower() == "dataset"
        assert labels.datasets_label() == "Datasets"
        assert labels.datasets_label_lower() == "datasets"
        assert labels.database_label() == "Database"
        assert labels.database_label_lower() == "database"
        assert labels.databases_label() == "Databases"
        assert labels.databases_label_lower() == "databases"
        assert labels.database_connections_menu_label() == "Database Connections"


def test_labels_feature_flag_on() -> None:
    with patch(
        "zobi.feature_flag_manager.is_feature_enabled",
        return_value=True,
    ):
        assert labels.dataset_label() == "Datasource"
        assert labels.dataset_label_lower() == "datasource"
        assert labels.datasets_label() == "Datasources"
        assert labels.datasets_label_lower() == "datasources"
        assert labels.database_label() == "Data connection"
        assert labels.database_label_lower() == "data connection"
        assert labels.databases_label() == "Data connections"
        assert labels.databases_label_lower() == "data connections"
        assert labels.database_connections_menu_label() == "Data Connections"
