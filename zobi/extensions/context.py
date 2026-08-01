
"""
Extension Context Management - provides ambient context during extension loading.

This module provides a thread-local context system that allows decorators to
automatically detect whether they are being called in host or extension code
during extension loading.
"""

from __future__ import annotations

import contextlib
from threading import local
from typing import Any, Generator

from zobi_core.extensions.types import Manifest

# Thread-local storage for extension context
_extension_context: local = local()


class ExtensionContext:
    """Manages ambient extension context during loading."""

    def __init__(self, manifest: Manifest):
        self.manifest = manifest

    def __enter__(self) -> "ExtensionContext":
        if getattr(_extension_context, "current", None) is not None:
            current_extension = _extension_context.current.manifest.id
            raise RuntimeError(
                f"Cannot initialize extension {self.manifest.id} while extension "
                f"{current_extension} is already being initialized. "
                f"Nested extension initialization is not supported."
            )

        _extension_context.current = self
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        # Clear the current context
        _extension_context.current = None


class ExtensionContextWrapper:
    """Wrapper for extension context with extensible properties."""

    def __init__(self, manifest: Manifest):
        self._manifest = manifest

    @property
    def manifest(self) -> Manifest:
        """Get the extension manifest."""
        return self._manifest

    # Future: Add other context properties here
    # @property
    # def security_context(self) -> SecurityContext: ...
    # @property
    # def build_info(self) -> BuildInfo: ...


def get_current_extension_context() -> ExtensionContextWrapper | None:
    """Get the currently active extension context wrapper, or None if in host code."""
    if context := getattr(_extension_context, "current", None):
        return ExtensionContextWrapper(context.manifest)
    return None


@contextlib.contextmanager
def extension_context(manifest: Manifest) -> Generator[None, None, None]:
    """Context manager for setting extension context during loading."""
    with ExtensionContext(manifest):
        yield
