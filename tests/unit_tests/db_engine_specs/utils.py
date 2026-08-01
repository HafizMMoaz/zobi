from __future__ import annotations

from datetime import datetime
from typing import Any, TYPE_CHECKING

from sqlalchemy import types

from zobi.utils.core import GenericDataType

if TYPE_CHECKING:
    from zobi.db_engine_specs.base import BaseEngineSpec


def assert_convert_dttm(
    db_engine_spec: type[BaseEngineSpec],
    target_type: str,
    expected_result: str | None,
    dttm: datetime,
    db_extra: dict[str, Any] | None = None,
) -> None:
    for target in (
        target_type,
        target_type.upper(),
        target_type.lower(),
        target_type.capitalize(),
    ):
        assert (
            result := db_engine_spec.convert_dttm(
                target_type=target,
                dttm=dttm,
                db_extra=db_extra,
            )
        ) == expected_result, result


def assert_column_spec(
    db_engine_spec: type[BaseEngineSpec],
    native_type: str,
    sqla_type: type[types.TypeEngine],
    attrs: dict[str, Any] | None,
    generic_type: GenericDataType,
    is_dttm: bool,
) -> None:
    assert (column_spec := db_engine_spec.get_column_spec(native_type)) is not None
    assert isinstance(column_spec.sqla_type, sqla_type)

    for key, value in (attrs or {}).items():
        assert getattr(column_spec.sqla_type, key) == value

    assert column_spec.generic_type == generic_type
    assert column_spec.is_dttm == is_dttm
