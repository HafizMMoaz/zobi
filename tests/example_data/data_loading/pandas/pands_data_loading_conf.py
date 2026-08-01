from __future__ import annotations

from typing import Any

default_pandas_data_loader_config = {
    "if_exists": "replace",
    "chunksize": 500,
    "index": False,
    "method": "multi",
    "strftime": "%Y-%m-%d %H:%M:%S",
    "support_datetime_type": False,
}


class PandasLoaderConfigurations:
    if_exists: str
    chunksize: int
    index: bool
    method: str
    strftime: str
    support_datetime_type: bool

    def __init__(
        self,
        *,
        if_exists: str,
        chunksize: int,
        index: bool,
        method: str,
        strftime: str,
        support_datetime_type: bool,
    ):
        self.if_exists = if_exists
        self.chunksize = chunksize
        self.index = index
        self.method = method
        self.strftime = strftime
        self.support_datetime_type = support_datetime_type

    @classmethod
    def make_from_dict(cls, _dict: dict[str, Any]) -> PandasLoaderConfigurations:
        copy_dict = default_pandas_data_loader_config.copy()
        copy_dict.update(_dict)
        return PandasLoaderConfigurations(**copy_dict)  # type: ignore

    @classmethod
    def make_default(cls) -> PandasLoaderConfigurations:
        return cls.make_from_dict({})
