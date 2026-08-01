import pytest
from marshmallow.exceptions import ValidationError

from zobi.annotation_layers.annotations.schemas import (
    AnnotationPostSchema,
    AnnotationPutSchema,
)
from zobi.annotation_layers.schemas import (
    AnnotationLayerPostSchema,
    AnnotationLayerPutSchema,
)
from tests.unit_tests.annotation_layers.fixtures import (
    END_DTTM,
    END_STR,
    START_DTTM,
    START_STR,
)


def test_annotation_layer_post_schema_with_name() -> None:
    result = AnnotationLayerPostSchema().load({"name": "foo"})
    assert result["name"] == "foo"
    assert "descr" not in result


def test_annotation_layer_post_schema_with_name_and_descr() -> None:
    result = AnnotationLayerPostSchema().load({"name": "foo", "descr": "bar"})
    assert result["name"] == "foo"
    assert result["descr"] == "bar"


def test_annotation_layer_post_schema_with_null_name() -> None:
    with pytest.raises(ValidationError):
        AnnotationLayerPostSchema().load({"name": None})


def test_annotation_layer_post_schema_empty() -> None:
    with pytest.raises(ValidationError):
        AnnotationLayerPostSchema().load({})


def test_annotation_layer_put_schema_empty() -> None:
    result = AnnotationLayerPutSchema().load({})
    assert result == {}


def test_annotation_layer_put_schema_with_null_name() -> None:
    with pytest.raises(ValidationError):
        AnnotationLayerPutSchema().load({"name": None})


def test_annotation_layer_put_schema_with_null_descr() -> None:
    with pytest.raises(ValidationError):
        AnnotationLayerPutSchema().load({"descr": None})


def test_annotation_post_schema_basic() -> None:
    result = AnnotationPostSchema().load(
        {"short_descr": "foo", "start_dttm": START_STR, "end_dttm": END_STR}
    )
    assert result["short_descr"] == "foo"
    assert result["start_dttm"] == START_DTTM
    assert result["end_dttm"] == END_DTTM


def test_annotation_post_schema_full() -> None:
    result = AnnotationPostSchema().load(
        {
            "short_descr": "foo",
            "long_descr": "bar",
            "start_dttm": START_STR,
            "end_dttm": END_STR,
            "json_metadata": '{"abc": 123}',
        }
    )
    assert result["short_descr"] == "foo"
    assert result["long_descr"] == "bar"
    assert result["start_dttm"] == START_DTTM
    assert result["end_dttm"] == END_DTTM
    assert result["json_metadata"] == '{"abc": 123}'


def test_annotation_post_schema_short_descr_null() -> None:
    with pytest.raises(ValidationError):
        AnnotationPostSchema().load(
            {"short_descr": None, "start_dttm": START_STR, "end_dttm": END_STR}
        )


def test_annotation_post_schema_start_dttm_null() -> None:
    with pytest.raises(ValidationError):
        AnnotationPostSchema().load(  # noqa: F841
            {"short_descr": "foo", "start_dttm": None, "end_dttm": END_STR}
        )


def test_annotation_post_schema_end_dttm_null() -> None:
    with pytest.raises(ValidationError):
        AnnotationPostSchema().load(
            {"short_descr": "foo", "start_dttm": START_STR, "end_dttm": None}
        )


def test_annotation_put_schema_empty() -> None:
    result = AnnotationPutSchema().load({})
    assert result == {}


def test_annotation_put_schema_short_descr_null() -> None:
    with pytest.raises(ValidationError):
        AnnotationPutSchema().load({"short_descr": None})


def test_annotation_put_schema_start_dttm_null() -> None:
    with pytest.raises(ValidationError):
        AnnotationPutSchema().load({"start_dttm": None})


def test_annotation_put_schema_end_dttm_null() -> None:
    with pytest.raises(ValidationError):
        AnnotationPutSchema().load({"end_dttm": None})


def test_annotation_put_schema_json_metadata() -> None:
    result = AnnotationPutSchema().load({"json_metadata": '{"abc": 123}'})
    assert result["json_metadata"] == '{"abc": 123}'


def test_annotation_put_schema_json_metadata_null() -> None:
    result = AnnotationPutSchema().load({"json_metadata": None})
    assert result["json_metadata"] is None


def test_annotation_put_schema_json_metadata_empty() -> None:
    result = AnnotationPutSchema().load({"json_metadata": ""})
    assert result["json_metadata"] == ""


def test_annotation_put_schema_json_metadata_invalid() -> None:
    with pytest.raises(ValidationError):
        AnnotationPutSchema().load({"json_metadata": "foo bar"})
