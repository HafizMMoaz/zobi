from dataclasses import dataclass
from typing import Optional

from zobi.key_value.types import KeyValueCodec


@dataclass
class CommandParameters:
    resource_id: int
    codec: Optional[KeyValueCodec] = None
    tab_id: Optional[int] = None
    key: Optional[str] = None
    value: Optional[str] = None
