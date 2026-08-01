
from unittest.mock import MagicMock

import pytest
from pytest_mock import MockerFixture

from zobi.commands.semantic_layer.delete import DeleteSemanticLayerCommand
from zobi.commands.semantic_layer.exceptions import SemanticLayerNotFoundError


def test_delete_semantic_layer_success(mocker: MockerFixture) -> None:
    """Test successful deletion of a semantic layer."""
    mock_model = MagicMock()

    dao = mocker.patch(
        "zobi.commands.semantic_layer.delete.SemanticLayerDAO",
    )
    dao.find_by_uuid.return_value = mock_model

    DeleteSemanticLayerCommand("some-uuid").run()

    dao.find_by_uuid.assert_called_once_with("some-uuid")
    dao.delete.assert_called_once_with([mock_model])


def test_delete_semantic_layer_not_found(mocker: MockerFixture) -> None:
    """Test that SemanticLayerNotFoundError is raised when model is missing."""
    dao = mocker.patch(
        "zobi.commands.semantic_layer.delete.SemanticLayerDAO",
    )
    dao.find_by_uuid.return_value = None

    with pytest.raises(SemanticLayerNotFoundError):
        DeleteSemanticLayerCommand("missing-uuid").run()


def test_delete_semantic_view_success(mocker: MockerFixture) -> None:
    """Test successful deletion of a semantic view."""
    mock_model = MagicMock()

    dao = mocker.patch(
        "zobi.commands.semantic_layer.delete.SemanticViewDAO",
    )
    dao.find_by_id.return_value = mock_model

    # Admin is owner of everything — no exception raised
    mocker.patch(
        "zobi.commands.semantic_layer.delete.security_manager"
    ).raise_for_ownership.return_value = None

    from zobi.commands.semantic_layer.delete import DeleteSemanticViewCommand

    DeleteSemanticViewCommand(42).run()

    dao.find_by_id.assert_called_once_with(42, id_column="id")
    dao.delete.assert_called_once_with([mock_model])


def test_delete_semantic_view_forbidden(mocker: MockerFixture) -> None:
    """Test that SemanticViewForbiddenError is raised for non-owners."""
    from zobi.commands.semantic_layer.delete import DeleteSemanticViewCommand
    from zobi.commands.semantic_layer.exceptions import SemanticViewForbiddenError
    from zobi.exceptions import ZobiSecurityException

    dao = mocker.patch(
        "zobi.commands.semantic_layer.delete.SemanticViewDAO",
    )
    dao.find_by_id.return_value = MagicMock()

    mocker.patch(
        "zobi.security_manager.raise_for_ownership",
        side_effect=ZobiSecurityException(MagicMock()),
    )

    with pytest.raises(SemanticViewForbiddenError):
        DeleteSemanticViewCommand(42).run()


def test_delete_semantic_view_not_found(mocker: MockerFixture) -> None:
    """Test that SemanticViewNotFoundError is raised when view is missing."""
    dao = mocker.patch(
        "zobi.commands.semantic_layer.delete.SemanticViewDAO",
    )
    dao.find_by_id.return_value = None

    from zobi.commands.semantic_layer.delete import DeleteSemanticViewCommand
    from zobi.commands.semantic_layer.exceptions import (
        SemanticViewNotFoundError,
    )

    with pytest.raises(SemanticViewNotFoundError):
        DeleteSemanticViewCommand(999).run()


def test_bulk_delete_semantic_view_success(mocker: MockerFixture) -> None:
    """Test successful bulk deletion of semantic views."""
    mock_models = [MagicMock(), MagicMock()]

    dao = mocker.patch(
        "zobi.commands.semantic_layer.delete.SemanticViewDAO",
    )
    dao.find_by_ids.return_value = mock_models

    mocker.patch(
        "zobi.commands.semantic_layer.delete.security_manager"
    ).raise_for_ownership.return_value = None

    from zobi.commands.semantic_layer.delete import BulkDeleteSemanticViewCommand

    BulkDeleteSemanticViewCommand([1, 2]).run()

    dao.find_by_ids.assert_called_once_with([1, 2], id_column="id")
    dao.delete.assert_called_once_with(mock_models)


def test_bulk_delete_semantic_view_forbidden(mocker: MockerFixture) -> None:
    """Test that SemanticViewForbiddenError is raised for non-owners."""
    from zobi.commands.semantic_layer.delete import BulkDeleteSemanticViewCommand
    from zobi.commands.semantic_layer.exceptions import SemanticViewForbiddenError
    from zobi.exceptions import ZobiSecurityException

    dao = mocker.patch(
        "zobi.commands.semantic_layer.delete.SemanticViewDAO",
    )
    dao.find_by_ids.return_value = [MagicMock(), MagicMock()]

    mocker.patch(
        "zobi.security_manager.raise_for_ownership",
        side_effect=ZobiSecurityException(MagicMock()),
    )

    with pytest.raises(SemanticViewForbiddenError):
        BulkDeleteSemanticViewCommand([1, 2]).run()


def test_bulk_delete_semantic_view_not_found(mocker: MockerFixture) -> None:
    """Test that SemanticViewNotFoundError is raised when any id is missing."""
    dao = mocker.patch(
        "zobi.commands.semantic_layer.delete.SemanticViewDAO",
    )
    # Only one model returned for two requested ids
    dao.find_by_ids.return_value = [MagicMock()]

    from zobi.commands.semantic_layer.delete import BulkDeleteSemanticViewCommand
    from zobi.commands.semantic_layer.exceptions import SemanticViewNotFoundError

    with pytest.raises(SemanticViewNotFoundError):
        BulkDeleteSemanticViewCommand([1, 2]).run()
