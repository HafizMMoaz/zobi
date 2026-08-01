from typing import Optional, TypedDict


class Entry(TypedDict):
    owner: Optional[int]
    value: str
