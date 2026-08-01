import logging
from typing import Optional

import pandas as pd
from flask_babel import lazy_gettext as _
from werkzeug.datastructures import FileStorage

from zobi.commands.database.exceptions import DatabaseUploadFailed
from zobi.commands.database.uploaders.base import (
    BaseDataReader,
    FileMetadata,
    ReaderOptions,
)

logger = logging.getLogger(__name__)

ROWS_TO_READ_METADATA = 2


class ExcelReaderOptions(ReaderOptions, total=False):
    sheet_name: str
    column_dates: list[str]
    columns_read: list[str]
    index_column: str
    decimal_character: str
    header_row: int
    null_values: list[str]
    rows_to_read: int
    skip_rows: int


class ExcelReader(BaseDataReader):
    def __init__(
        self,
        options: Optional[ExcelReaderOptions] = None,
    ) -> None:
        options = options or {}
        super().__init__(
            options=dict(options),
        )

    def file_to_dataframe(self, file: FileStorage) -> pd.DataFrame:
        """
        Read Excel file into a DataFrame

        :return: pandas DataFrame
        :throws DatabaseUploadFailed: if there is an error reading the file
        """

        kwargs = {
            "header": self._options.get("header_row", 0),
            "index_col": self._options.get("index_column"),
            "io": file,
            "keep_default_na": not self._options.get("null_values"),
            "decimal": self._options.get("decimal_character", "."),
            "na_values": self._options.get("null_values")
            if self._options.get("null_values")  # None if an empty list
            else None,
            "parse_dates": self._options.get("column_dates") or False,
            "skiprows": self._options.get("skip_rows", 0),
            "sheet_name": self._options.get("sheet_name", 0),
            "nrows": self._options.get("rows_to_read"),
        }
        if self._options.get("columns_read"):
            kwargs["usecols"] = self._options.get("columns_read")
        try:
            return pd.read_excel(**kwargs)
        except (
            pd.errors.ParserError,
            pd.errors.EmptyDataError,
            UnicodeDecodeError,
            ValueError,
        ) as ex:
            raise DatabaseUploadFailed(
                message=_("Parsing error: %(error)s", error=str(ex))
            ) from ex
        except Exception as ex:
            raise DatabaseUploadFailed(_("Error reading Excel file")) from ex

    def file_metadata(self, file: FileStorage) -> FileMetadata:
        try:
            excel_file = pd.ExcelFile(file)
        except (ValueError, AssertionError) as ex:
            raise DatabaseUploadFailed(
                message=_("Excel file format cannot be determined")
            ) from ex

        sheet_names = excel_file.sheet_names

        result: FileMetadata = {"items": []}
        for sheet in sheet_names:
            df = excel_file.parse(sheet, nrows=ROWS_TO_READ_METADATA)
            column_names = df.columns.tolist()
            result["items"].append(
                {
                    "sheet_name": sheet,
                    "column_names": column_names,
                }
            )
        return result
