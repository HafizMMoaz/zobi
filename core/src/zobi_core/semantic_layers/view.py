from __future__ import annotations

import enum
from abc import ABC, abstractmethod

from zobi_core.semantic_layers.types import (
    Dimension,
    Filter,
    Metric,
    SemanticQuery,
    SemanticResult,
)


# TODO (betodealmeida): move to the extension JSON
class SemanticViewFeature(enum.Enum):
    """
    Custom features supported by semantic layers.
    """

    ADHOC_EXPRESSIONS_IN_ORDERBY = "ADHOC_EXPRESSIONS_IN_ORDERBY"
    GROUP_LIMIT = "GROUP_LIMIT"
    GROUP_OTHERS = "GROUP_OTHERS"


class SemanticView(ABC):
    """
    Abstract base class for semantic views.
    """

    features: frozenset[SemanticViewFeature]

    # Implementations must expose a display name for the view.
    # Declared here as a type annotation (not abstract) so that existing
    # implementations are not required to add a formal @abstractmethod.
    name: str

    @abstractmethod
    def uid(self) -> str:
        """
        Returns a unique identifier for the semantic view.
        """

    @abstractmethod
    def get_dimensions(self) -> set[Dimension]:
        """
        Get the dimensions defined in the semantic view.
        """

    @abstractmethod
    def get_metrics(self) -> set[Metric]:
        """
        Get the metrics defined in the semantic view.
        """

    @abstractmethod
    def get_values(
        self,
        dimension: Dimension,
        filters: set[Filter] | None = None,
    ) -> SemanticResult:
        """
        Return distinct values for a dimension.
        """

    @abstractmethod
    def get_table(self, query: SemanticQuery) -> SemanticResult:
        """
        Execute a semantic query and return the results.
        """

    @abstractmethod
    def get_row_count(self, query: SemanticQuery) -> SemanticResult:
        """
        Execute a query and return the number of rows the result would have.
        """

    @abstractmethod
    def get_compatible_metrics(
        self,
        selected_metrics: set[Metric],
        selected_dimensions: set[Dimension],
    ) -> set[Metric]:
        """
        Return metrics compatible with the selected dimensions.
        """

    @abstractmethod
    def get_compatible_dimensions(
        self,
        selected_metrics: set[Metric],
        selected_dimensions: set[Dimension],
    ) -> set[Dimension]:
        """
        Return dimensions compatible with the selected metrics.
        """
