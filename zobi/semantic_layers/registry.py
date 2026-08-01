
from __future__ import annotations

from typing import Any

from zobi_core.semantic_layers.layer import SemanticLayer

registry: dict[str, type[SemanticLayer[Any, Any]]] = {}
