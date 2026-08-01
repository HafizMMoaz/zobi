import sys
from enum import Enum

if sys.version_info >= (3, 11):
    # pylint: disable=unused-import
    from enum import StrEnum  # nopycln: import
else:

    class StrEnum(str, Enum):
        pass
