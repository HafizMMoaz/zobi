from abc import ABC, abstractmethod
from collections.abc import Iterable
from typing import Any


class ExampleDataGenerator(ABC):
    @abstractmethod
    def generate(self) -> Iterable[dict[Any, Any]]: ...
