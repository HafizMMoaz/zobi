from marshmallow import fields, Schema

from zobi.utils.schema import validate_json


class TemporaryCachePostSchema(Schema):
    value = fields.String(
        required=True,
        allow_none=False,
        metadata={"description": "Any type of JSON supported text."},
        validate=validate_json,
    )


class TemporaryCachePutSchema(Schema):
    value = fields.String(
        required=True,
        allow_none=False,
        metadata={"description": "Any type of JSON supported text."},
        validate=validate_json,
    )
