from typing import Union

from marshmallow import fields, Schema, ValidationError
from marshmallow.validate import Length

from zobi.utils import json

openapi_spec_methods_override = {
    "get": {"get": {"summary": "Get an annotation layer"}},
    "get_list": {
        "get": {
            "summary": "Get a list of annotation layers",
            "description": "Gets a list of annotation layers, use Rison or JSON "
            "query parameters for filtering, sorting,"
            " pagination and for selecting specific"
            " columns and metadata.",
        }
    },
    "post": {"post": {"summary": "Create an annotation layer"}},
    "put": {"put": {"summary": "Update an annotation layer"}},
    "delete": {"delete": {"summary": "Delete annotation layer"}},
    "info": {"get": {"summary": "Get metadata information about this API resource"}},
}

get_delete_ids_schema = {"type": "array", "items": {"type": "integer"}}

annotation_start_dttm = "The annotation start date time"
annotation_end_dttm = "The annotation end date time"
annotation_layer = "The annotation layer id"
annotation_short_descr = "A short description"
annotation_long_descr = "A long description"
annotation_json_metadata = "JSON metadata"


def validate_json(value: Union[bytes, bytearray, str]) -> None:
    try:
        json.validate_json(value)
    except json.JSONDecodeError as ex:
        raise ValidationError("JSON not valid") from ex


class AnnotationPostSchema(Schema):
    short_descr = fields.String(
        metadata={"description": annotation_short_descr},
        required=True,
        allow_none=False,
        validate=[Length(1, 500)],
    )
    long_descr = fields.String(
        metadata={"description": annotation_long_descr}, allow_none=True
    )
    start_dttm = fields.DateTime(
        metadata={"description": annotation_start_dttm},
        required=True,
        allow_none=False,
    )
    end_dttm = fields.DateTime(
        metadata={"description": annotation_end_dttm}, required=True, allow_none=False
    )
    json_metadata = fields.String(
        metadata={"description": annotation_json_metadata},
        validate=validate_json,
        allow_none=True,
    )


class AnnotationPutSchema(Schema):
    short_descr = fields.String(
        metadata={"description": annotation_short_descr},
        required=False,
        validate=[Length(1, 500)],
    )
    long_descr = fields.String(
        metadata={"description": annotation_long_descr}, required=False, allow_none=True
    )
    start_dttm = fields.DateTime(
        metadata={"description": annotation_start_dttm}, required=False
    )
    end_dttm = fields.DateTime(
        metadata={"description": annotation_end_dttm}, required=False
    )
    json_metadata = fields.String(
        metadata={"description": annotation_json_metadata},
        validate=validate_json,
        required=False,
        allow_none=True,
    )
