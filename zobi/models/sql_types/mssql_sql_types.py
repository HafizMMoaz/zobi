
# pylint: disable=abstract-method
import uuid
from typing import Any, Optional

from sqlalchemy.engine.interfaces import Dialect
from sqlalchemy.sql.sqltypes import CHAR
from sqlalchemy.sql.visitors import Visitable
from sqlalchemy.types import TypeDecorator

# _compiler_dispatch is defined to help with type compilation


class GUID(TypeDecorator):
    """
    A type for SQL Server's uniqueidentifier, stored as stringified UUIDs.
    """

    impl = CHAR

    @property
    def python_type(self) -> type[uuid.UUID]:
        """The Python type for this SQL type is `uuid.UUID`."""
        return uuid.UUID

    @classmethod
    def _compiler_dispatch(cls, _visitor: Visitable, **_kw: Any) -> str:
        """Return the SQL type for the GUID type, which is CHAR(36) in SQL Server."""
        return "CHAR(36)"

    def process_bind_param(self, value: str, dialect: Dialect) -> Optional[str]:
        """Prepare the UUID value for binding to the database."""
        if value is None:
            return None
        if not isinstance(value, uuid.UUID):
            return str(uuid.UUID(value))  # Convert to string UUID if needed
        return str(value)

    def process_result_value(
        self, value: Optional[str], dialect: Dialect
    ) -> Optional[uuid.UUID]:
        """Convert the string back to a UUID when retrieving from the database."""
        if value is None:
            return None
        return uuid.UUID(value)
