"""
Common Data Access Object API for core.

Provides dependency-injected DAO classes that will be replaced by
host implementations during initialization.

Usage:
    from zobi_core.common.daos import DatasetDAO, DatabaseDAO

    # Use standard BaseDAO methods
    datasets = DatasetDAO.find_all()
    dataset = DatasetDAO.find_one_or_none(id=123)
    DatasetDAO.create(attributes={"name": "New Dataset"})
"""

from abc import ABC, abstractmethod
from typing import Any, ClassVar, Generic, TypeVar

from flask_appbuilder.models.filters import BaseFilter
from sqlalchemy.orm import Query as SQLAQuery

from zobi_core.common.models import (
    Chart,
    CoreModel,
    Dashboard,
    Database,
    Dataset,
    KeyValue,
    Tag,
    User,
)

# Type variable bound to our CoreModel
T = TypeVar("T", bound=CoreModel)


class BaseDAO(Generic[T], ABC):
    """
    Abstract base class for DAOs.

    This ABC defines the base that all DAOs should implement,
    providing consistent CRUD operations across Zobi and extensions.
    """

    # Due to mypy limitations, we can't have `type[T]` here
    model_cls: ClassVar[type[Any] | None]
    base_filter: ClassVar[BaseFilter | None]
    id_column_name: ClassVar[str]
    uuid_column_name: ClassVar[str]

    @classmethod
    @abstractmethod
    def find_all(cls) -> list[T]:
        """Get all entities that fit the base_filter."""
        ...

    @classmethod
    @abstractmethod
    def find_one_or_none(cls, **filter_by: Any) -> T | None:
        """Get the first entity that fits the base_filter."""
        ...

    @classmethod
    @abstractmethod
    def create(
        cls,
        item: T | None = None,
        attributes: dict[str, Any] | None = None,
    ) -> T:
        """Create an object from the specified item and/or attributes."""
        ...

    @classmethod
    @abstractmethod
    def update(
        cls,
        item: T | None = None,
        attributes: dict[str, Any] | None = None,
    ) -> T:
        """Update an object from the specified item and/or attributes."""
        ...

    @classmethod
    @abstractmethod
    def delete(cls, items: list[T]) -> None:
        """Delete the specified items."""
        ...

    @classmethod
    @abstractmethod
    def query(cls, query: SQLAQuery) -> list[T]:
        """Execute query with base_filter applied."""
        ...

    @classmethod
    @abstractmethod
    def filter_by(cls, **filter_by: Any) -> list[T]:
        """Get all entries that fit the base_filter."""
        ...


class DatasetDAO(BaseDAO[Dataset]):
    """
    Abstract Dataset DAO interface.

    Host implementations will replace this class during initialization
    with a concrete implementation providing actual functionality.
    """

    # Class variables that will be set by host implementation
    model_cls = None
    base_filter = None
    id_column_name = "id"
    uuid_column_name = "uuid"


class DatabaseDAO(BaseDAO[Database]):
    """
    Abstract Database DAO interface.

    Host implementations will replace this class during initialization
    with a concrete implementation providing actual functionality.
    """

    # Class variables that will be set by host implementation
    model_cls = None
    base_filter = None
    id_column_name = "id"
    uuid_column_name = "uuid"


class ChartDAO(BaseDAO[Chart]):
    """
    Abstract Chart DAO interface.

    Host implementations will replace this class during initialization
    with a concrete implementation providing actual functionality.
    """

    # Class variables that will be set by host implementation
    model_cls = None
    base_filter = None
    id_column_name = "id"
    uuid_column_name = "uuid"


class DashboardDAO(BaseDAO[Dashboard]):
    """
    Abstract Dashboard DAO interface.

    Host implementations will replace this class during initialization
    with a concrete implementation providing actual functionality.
    """

    # Class variables that will be set by host implementation
    model_cls = None
    base_filter = None
    id_column_name = "id"
    uuid_column_name = "uuid"


class UserDAO(BaseDAO[User]):
    """
    Abstract User DAO interface.

    Host implementations will replace this class during initialization
    with a concrete implementation providing actual functionality.
    """

    # Class variables that will be set by host implementation
    model_cls = None
    base_filter = None
    id_column_name = "id"


class TagDAO(BaseDAO[Tag]):
    """
    Abstract Tag DAO interface.

    Host implementations will replace this class during initialization
    with a concrete implementation providing actual functionality.
    """

    # Class variables that will be set by host implementation
    model_cls = None
    base_filter = None
    id_column_name = "id"


class KeyValueDAO(BaseDAO[KeyValue]):
    """
    Abstract KeyValue DAO interface.

    Host implementations will replace this class during initialization
    with a concrete implementation providing actual functionality.
    """

    # Class variables that will be set by host implementation
    model_cls = None
    base_filter = None
    id_column_name = "id"


__all__ = [
    "BaseDAO",
    "DatasetDAO",
    "DatabaseDAO",
    "ChartDAO",
    "DashboardDAO",
    "UserDAO",
    "TagDAO",
    "KeyValueDAO",
]
