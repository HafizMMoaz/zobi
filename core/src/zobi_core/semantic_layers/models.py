"""
Semantic layer model interfaces for core.

Provides abstract model classes for semantic layers and views that will be
replaced by the host implementation's concrete SQLAlchemy models during
initialization.

Usage:
    from zobi_core.semantic_layers.models import (
        SemanticLayerModel,
        SemanticViewModel,
    )
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from zobi_core.common.models import CoreModel


class SemanticLayerModel(CoreModel):
    """
    Abstract interface for the SemanticLayer database model.

    Host implementations will replace this class during initialization
    with a concrete SQLAlchemy model providing actual persistence.
    """

    __abstract__ = True

    # Type hints for expected column attributes
    uuid: UUID
    name: str
    description: str | None
    type: str
    configuration: str
    configuration_version: int
    cache_timeout: int | None
    created_on: datetime | None
    changed_on: datetime | None


class SemanticViewModel(CoreModel):
    """
    Abstract interface for the SemanticView database model.

    Host implementations will replace this class during initialization
    with a concrete SQLAlchemy model providing actual persistence.
    """

    __abstract__ = True

    # Type hints for expected column attributes
    id: int
    uuid: UUID
    name: str
    description: str | None
    configuration: str
    configuration_version: int
    cache_timeout: int | None
    semantic_layer_uuid: UUID
    created_on: datetime | None
    changed_on: datetime | None


__all__ = ["SemanticLayerModel", "SemanticViewModel"]
