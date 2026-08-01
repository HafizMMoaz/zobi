from datetime import datetime
from typing import Any, Optional

import pytest
from sqlalchemy import column  # noqa: F401

from tests.unit_tests.db_engine_specs.utils import assert_convert_dttm
from tests.unit_tests.fixtures.common import dttm  # noqa: F401


@pytest.mark.parametrize(
    "target_type,db_extra,expected_result",
    [
        ("DateTime", None, "CAST('2019-01-02T03:04:05' AS DATETIME)"),
        (
            "DateTime",
            {"version": "7.7"},
            "CAST('2019-01-02T03:04:05' AS DATETIME)",
        ),
        (
            "DateTime",
            {"version": "7.8"},
            "DATETIME_PARSE('2019-01-02 03:04:05', 'yyyy-MM-dd HH:mm:ss')",
        ),
        (
            "DateTime",
            {"version": "unparseable semver version"},
            "CAST('2019-01-02T03:04:05' AS DATETIME)",
        ),
        ("Unknown", None, None),
    ],
)
def test_elasticsearch_convert_dttm(
    target_type: str,
    db_extra: Optional[dict[str, Any]],
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    from zobi.db_engine_specs.elasticsearch import (
        ElasticSearchEngineSpec as spec,  # noqa: N813
    )

    assert_convert_dttm(spec, target_type, expected_result, dttm, db_extra)


@pytest.mark.parametrize(
    "target_type,expected_result",
    [
        ("DateTime", "'2019-01-02T03:04:05'"),
        ("Unknown", None),
    ],
)
def test_opendistro_convert_dttm(
    target_type: str,
    expected_result: Optional[str],
    dttm: datetime,  # noqa: F811
) -> None:
    from zobi.db_engine_specs.elasticsearch import (
        OpenDistroEngineSpec as spec,  # noqa: N813
    )

    assert_convert_dttm(spec, target_type, expected_result, dttm)


@pytest.mark.parametrize(
    "original,expected",
    [
        ("Col", "Col"),
        ("Col.keyword", "Col_keyword"),
    ],
)
def test_opendistro_sqla_column_label(original: str, expected: str) -> None:
    """
    DB Eng Specs (opendistro): Test column label
    """
    from zobi.db_engine_specs.elasticsearch import OpenDistroEngineSpec

    assert OpenDistroEngineSpec.make_label_compatible(original) == expected
