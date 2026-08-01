from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from tests.common.example_data.data_loading.data_definitions.types import Table


class DataLoader(ABC):
    @abstractmethod
    def load_table(self, table: Table) -> None: ...

    @abstractmethod
    def remove_table(self, table_name: str) -> None: ...
