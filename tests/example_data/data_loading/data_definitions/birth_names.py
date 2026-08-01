from sqlalchemy import DateTime, Integer, String

from tests.consts.birth_names import (
    DS,
    GENDER,
    NAME,
    NUM,
    NUM_BOYS,
    NUM_GIRLS,
    STATE,
    TABLE_NAME,
)
from tests.example_data.data_loading.data_definitions.types import (
    TableMetaData,
    TableMetaDataFactory,
)

BIRTH_NAMES_COLUMNS = {
    DS: DateTime,
    GENDER: String(16),
    NAME: String(255),
    NUM: Integer,
    STATE: String(10),
    NUM_BOYS: Integer,
    NUM_GIRLS: Integer,
}

BIRTH_NAMES_COLUMNS_WITHOUT_DATETIME = {
    DS: String(255),
    GENDER: String(16),
    NAME: String(255),
    NUM: Integer,
    STATE: String(10),
    NUM_BOYS: Integer,
    NUM_GIRLS: Integer,
}


class BirthNamesMetaDataFactory(TableMetaDataFactory):
    _datetime_type_support: bool

    def __init__(self, datetime_type_support: bool = True):
        self._datetime_type_support = datetime_type_support

    def make(self) -> TableMetaData:
        if self._datetime_type_support:
            return TableMetaData(TABLE_NAME, BIRTH_NAMES_COLUMNS.copy())
        return TableMetaData(TABLE_NAME, BIRTH_NAMES_COLUMNS_WITHOUT_DATETIME.copy())
