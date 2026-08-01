
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest


def test_semantic_layer_stub_raises() -> None:
    """The stub decorator raises NotImplementedError before initialization."""
    import importlib

    import zobi_core.semantic_layers.decorators as mod

    # Reload to get the original stub (injection may have replaced it)
    importlib.reload(mod)

    with pytest.raises(NotImplementedError):
        mod.semantic_layer(id="test", name="Test")


def test_inject_semantic_layer_host_context() -> None:
    """The injected decorator registers a class in host context."""
    from zobi.core.api.core_api_injection import (
        inject_semantic_layer_implementations,
    )
    from zobi.semantic_layers.registry import registry

    # Clear registry for test isolation
    registry.clear()

    inject_semantic_layer_implementations()

    import zobi_core.semantic_layers.decorators as mod

    # Host context: no extension context active, so no prefix
    with patch(
        "zobi.extensions.context.get_current_extension_context",
        return_value=None,
    ):

        @mod.semantic_layer(id="test_layer", name="Test Layer", description="A test")
        class FakeLayer:
            pass

    assert "test_layer" in registry
    assert registry["test_layer"] is FakeLayer
    assert FakeLayer.name == "Test Layer"  # type: ignore[attr-defined]
    assert FakeLayer.description == "A test"  # type: ignore[attr-defined]

    # Cleanup
    registry.pop("test_layer", None)


def test_inject_semantic_layer_extension_context() -> None:
    """The injected decorator prefixes ID in extension context."""
    from zobi.core.api.core_api_injection import (
        inject_semantic_layer_implementations,
    )
    from zobi.semantic_layers.registry import registry

    registry.clear()

    mock_context = MagicMock()
    mock_context.manifest.publisher = "acme"
    mock_context.manifest.name = "analytics"

    inject_semantic_layer_implementations()

    import zobi_core.semantic_layers.decorators as mod

    # Extension context is checked at decorator call time via module lookup
    with patch(
        "zobi.extensions.context.get_current_extension_context",
        return_value=mock_context,
    ):

        @mod.semantic_layer(id="ext_layer", name="Extension Layer")
        class ExtLayer:
            pass

    expected_id = "extensions.acme.analytics.ext_layer"
    assert expected_id in registry
    assert registry[expected_id] is ExtLayer

    # Cleanup
    registry.pop(expected_id, None)
