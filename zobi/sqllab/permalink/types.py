from typing import Optional, TypedDict


class SqlLabPermalinkValue(TypedDict):
    catalog: Optional[str]
    dbId: int
    name: str
    schema: Optional[str]
    sql: str
    autorun: bool
    templateParams: Optional[str]
