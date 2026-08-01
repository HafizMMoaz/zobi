from __future__ import annotations

from typing import TYPE_CHECKING

from pandas import DataFrame

from tests.common.logger_utils import log
from tests.example_data.data_loading.pandas.pandas_data_loader import TableToDfConvertor

if TYPE_CHECKING:
    from tests.example_data.data_loading.data_definitions.types import Table


@log
class TableToDfConvertorImpl(TableToDfConvertor):
    convert_datetime_to_str: bool
    _time_format: str | None

    def __init__(
        self, convert_ds_to_datetime: bool, time_format: str | None = None
    ) -> None:
        self.convert_datetime_to_str = convert_ds_to_datetime
        self._time_format = time_format

    def convert(self, table: Table) -> DataFrame:
        df_rv = DataFrame(table.data)
        if self._should_convert_datetime_to_str():
            df_rv.ds = df_rv.ds.dt.strftime(self._time_format)
        return df_rv

    def _should_convert_datetime_to_str(self) -> bool:
        return self.convert_datetime_to_str and self._time_format is not None
