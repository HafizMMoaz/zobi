# pylint: disable=import-outside-toplevel

from typing import Any, Callable

import pytest

from zobi.db_engine_specs.ocient import (
    _point_list_to_wkt,
    _sanitized_ocient_type_codes,
)
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType


def ocient_is_installed() -> bool:
    return len(_sanitized_ocient_type_codes) > 0


# (msg,expected)
MARSHALED_OCIENT_ERRORS: list[tuple[str, ZobiError]] = [
    (
        "The referenced user does not exist (User 'mj' not found)",
        ZobiError(
            message='The username "mj" does not exist.',
            error_type=ZobiErrorType.CONNECTION_INVALID_USERNAME_ERROR,
            level=ErrorLevel.ERROR,
            extra={
                "engine_name": "Ocient",
                "issue_codes": [
                    {
                        "code": 1012,
                        "message": "Issue 1012 - The username provided when connecting to a database is not valid.",  # noqa: E501
                    }
                ],
            },
        ),
    ),
    (
        "The userid/password combination was not valid (Incorrect password for user)",
        ZobiError(
            message="The user/password combination is not valid (Incorrect password for user).",  # noqa: E501
            error_type=ZobiErrorType.CONNECTION_INVALID_PASSWORD_ERROR,
            level=ErrorLevel.ERROR,
            extra={
                "engine_name": "Ocient",
                "issue_codes": [
                    {
                        "code": 1013,
                        "message": "Issue 1013 - The password provided when connecting to a database is not valid.",  # noqa: E501
                    }
                ],
            },
        ),
    ),
    (
        "No database named 'bulls' exists",
        ZobiError(
            message='Could not connect to database: "bulls"',
            error_type=ZobiErrorType.CONNECTION_UNKNOWN_DATABASE_ERROR,
            level=ErrorLevel.ERROR,
            extra={
                "engine_name": "Ocient",
                "issue_codes": [
                    {
                        "code": 1015,
                        "message": "Issue 1015 - Either the database is spelled incorrectly or does not exist.",  # noqa: E501
                    }
                ],
            },
        ),
    ),
    (
        "Unable to connect to unitedcenter.com:4050",
        ZobiError(
            message='Could not resolve hostname: "unitedcenter.com".',
            error_type=ZobiErrorType.CONNECTION_INVALID_HOSTNAME_ERROR,
            level=ErrorLevel.ERROR,
            extra={
                "engine_name": "Ocient",
                "issue_codes": [
                    {
                        "code": 1007,
                        "message": "Issue 1007 - The hostname provided can't be resolved.",  # noqa: E501
                    }
                ],
            },
        ),
    ),
    (
        "Port out of range 0-65535",
        ZobiError(
            message="Port out of range 0-65535",
            error_type=ZobiErrorType.CONNECTION_INVALID_PORT_ERROR,
            level=ErrorLevel.ERROR,
            extra={
                "engine_name": "Ocient",
                "issue_codes": [
                    {
                        "code": 1034,
                        "message": "Issue 1034 - The port number is invalid.",
                    }
                ],
            },
        ),
    ),
    (
        "An invalid connection string attribute was specified (failed to decrypt cipher text)",  # noqa: E501
        ZobiError(
            message="Invalid Connection String: Expecting String of the form 'ocient://user:pass@host:port/database'.",
            error_type=ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
            level=ErrorLevel.ERROR,
            extra={
                "engine_name": "Ocient",
                "issue_codes": [
                    {
                        "code": 1002,
                        "message": "Issue 1002 - The database returned an unexpected error.",  # noqa: E501
                    }
                ],
            },
        ),
    ),
    (
        "There is a syntax error in your statement (extraneous input 'foo bar baz' expecting {<EOF>, 'trace', 'using'})",  # noqa: E501
        ZobiError(
            message="Syntax Error: extraneous input \"foo bar baz\" expecting \"{<EOF>, 'trace', 'using'}",  # noqa: E501
            error_type=ZobiErrorType.SYNTAX_ERROR,
            level=ErrorLevel.ERROR,
            extra={
                "engine_name": "Ocient",
                "issue_codes": [
                    {
                        "code": 1030,
                        "message": "Issue 1030 - The query has a syntax error.",
                    }
                ],
            },
        ),
    ),
    (
        "There is a syntax error in your statement (mismatched input 'to' expecting {<EOF>, 'trace', 'using'})",  # noqa: E501
        ZobiError(
            message="Syntax Error: mismatched input \"to\" expecting \"{<EOF>, 'trace', 'using'}",  # noqa: E501
            error_type=ZobiErrorType.SYNTAX_ERROR,
            level=ErrorLevel.ERROR,
            extra={
                "engine_name": "Ocient",
                "issue_codes": [
                    {
                        "code": 1030,
                        "message": "Issue 1030 - The query has a syntax error.",
                    }
                ],
            },
        ),
    ),
    (
        "The referenced table or view 'goats' does not exist",
        ZobiError(
            message='Table or View "goats" does not exist.',
            error_type=ZobiErrorType.TABLE_DOES_NOT_EXIST_ERROR,
            level=ErrorLevel.ERROR,
            extra={
                "engine_name": "Ocient",
                "issue_codes": [
                    {
                        "code": 1003,
                        "message": "Issue 1003 - There is a syntax error in the SQL query. Perhaps there was a misspelling or a typo.",  # noqa: E501
                    },
                    {
                        "code": 1005,
                        "message": "Issue 1005 - The table was deleted or renamed in the database.",  # noqa: E501
                    },
                ],
            },
        ),
    ),
    (
        "The reference to column 'goats' is not valid",
        ZobiError(
            message='Invalid reference to column: "goats"',
            error_type=ZobiErrorType.COLUMN_DOES_NOT_EXIST_ERROR,
            level=ErrorLevel.ERROR,
            extra={
                "engine_name": "Ocient",
                "issue_codes": [
                    {
                        "code": 1003,
                        "message": "Issue 1003 - There is a syntax error in the SQL query. Perhaps there was a misspelling or a typo.",  # noqa: E501
                    },
                    {
                        "code": 1004,
                        "message": "Issue 1004 - The column was deleted or renamed in the database.",  # noqa: E501
                    },
                ],
            },
        ),
    ),
]


@pytest.mark.parametrize("msg,expected", MARSHALED_OCIENT_ERRORS)
def test_connection_errors(msg: str, expected: ZobiError) -> None:
    from zobi.db_engine_specs.ocient import OcientEngineSpec

    result = OcientEngineSpec.extract_errors(Exception(msg))
    assert result == [expected]


def _generate_gis_type_sanitization_test_cases() -> list[
    tuple[str, int, Any, dict[str, Any]]
]:
    if not ocient_is_installed():
        return []

    from pyocient import _STLinestring, _STPoint, _STPolygon, TypeCodes

    return [
        (
            "empty_point",
            TypeCodes.ST_POINT,
            _STPoint(long=float("inf"), lat=float("inf")),
            {
                "geometry": None,
                "properties": {},
                "type": "Feature",
            },
        ),
        (
            "valid_point",
            TypeCodes.ST_POINT,
            _STPoint(long=float(33), lat=float(45)),
            {
                "geometry": {
                    "coordinates": [33.0, 45.0],
                    "type": "Point",
                },
                "properties": {},
                "type": "Feature",
            },
        ),
        (
            "empty_line",
            TypeCodes.ST_LINESTRING,
            _STLinestring([]),
            {
                "geometry": None,
                "properties": {},
                "type": "Feature",
            },
        ),
        (
            "valid_line",
            TypeCodes.ST_LINESTRING,
            _STLinestring(
                [_STPoint(long=t[0], lat=t[1]) for t in [(1, 0), (1, 1), (1, 2)]]
            ),
            {
                "geometry": {
                    "coordinates": [[1, 0], [1, 1], [1, 2]],
                    "type": "LineString",
                },
                "properties": {},
                "type": "Feature",
            },
        ),
        (
            "downcast_line_to_point",
            TypeCodes.ST_LINESTRING,
            _STLinestring([_STPoint(long=t[0], lat=t[1]) for t in [(1, 0)]]),
            {
                "geometry": {
                    "coordinates": [1, 0],
                    "type": "Point",
                },
                "properties": {},
                "type": "Feature",
            },
        ),
        (
            "empty_polygon",
            TypeCodes.ST_POLYGON,
            _STPolygon(exterior=[], holes=[]),
            {
                "geometry": None,
                "properties": {},
                "type": "Feature",
            },
        ),
        (
            "valid_polygon_no_holes",
            TypeCodes.ST_POLYGON,
            _STPolygon(
                exterior=[
                    _STPoint(long=t[0], lat=t[1]) for t in [(1, 0), (1, 1), (1, 0)]
                ],
                holes=[],
            ),
            {
                "geometry": {
                    "coordinates": [[[1, 0], [1, 1], [1, 0]]],
                    "type": "Polygon",
                },
                "properties": {},
                "type": "Feature",
            },
        ),
        (
            "valid_polygon_with_holes",
            TypeCodes.ST_POLYGON,
            _STPolygon(
                exterior=[
                    _STPoint(long=t[0], lat=t[1]) for t in [(1, 0), (1, 1), (1, 0)]
                ],
                holes=[
                    [_STPoint(long=t[0], lat=t[1]) for t in [(2, 0), (2, 1), (2, 0)]],
                    [_STPoint(long=t[0], lat=t[1]) for t in [(3, 0), (3, 1), (3, 0)]],
                ],
            ),
            {
                "geometry": {
                    "coordinates": [
                        [[1, 0], [1, 1], [1, 0]],
                        [[2, 0], [2, 1], [2, 0]],
                        [[3, 0], [3, 1], [3, 0]],
                    ],
                    "type": "Polygon",
                },
                "properties": {},
                "type": "Feature",
            },
        ),
        (
            "downcast_poly_to_point",
            TypeCodes.ST_POLYGON,
            _STPolygon(
                exterior=[_STPoint(long=t[0], lat=t[1]) for t in [(1, 0)]],
                holes=[],
            ),
            {
                "geometry": {
                    "coordinates": [1, 0],
                    "type": "Point",
                },
                "properties": {},
                "type": "Feature",
            },
        ),
        (
            "downcast_poly_to_line",
            TypeCodes.ST_POLYGON,
            _STPolygon(
                exterior=[_STPoint(long=t[0], lat=t[1]) for t in [(1, 0), (0, 1)]],
                holes=[],
            ),
            {
                "geometry": {
                    "coordinates": [[1, 0], [0, 1]],
                    "type": "LineString",
                },
                "properties": {},
                "type": "Feature",
            },
        ),
    ]


@pytest.mark.skipif(not ocient_is_installed(), reason="requires ocient dependencies")
@pytest.mark.parametrize(
    "name,type_code,geo,expected", _generate_gis_type_sanitization_test_cases()
)
def test_gis_type_sanitization(
    name: str, type_code: int, geo: Any, expected: Any
) -> None:
    # Hack to silence erroneous mypy errors
    def die(any: Any) -> Callable[[Any], Any]:
        pytest.fail(f"no sanitizer for type code {type_code}")
        raise AssertionError()

    type_sanitizer = _sanitized_ocient_type_codes.get(type_code, die)
    actual = type_sanitizer(geo)
    assert expected == actual


@pytest.mark.skipif(not ocient_is_installed(), reason="requires ocient dependencies")
def test_point_list_to_wkt() -> None:
    from pyocient import _STPoint

    wkt = _point_list_to_wkt(
        [_STPoint(long=t[0], lat=t[1]) for t in [(2, 0), (2, 1), (2, 0)]]
    )
    assert wkt == "LINESTRING(2 0, 2 1, 2 0)"
