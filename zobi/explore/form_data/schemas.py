from marshmallow import fields, Schema, validate

from zobi.utils.core import DatasourceType


class FormDataPostSchema(Schema):
    datasource_id = fields.Integer(
        required=True, allow_none=False, metadata={"description": "The datasource ID"}
    )
    datasource_type = fields.String(
        required=True,
        allow_none=False,
        metadata={"description": "The datasource type"},
        validate=validate.OneOf(choices=[ds.value for ds in DatasourceType]),
    )
    chart_id = fields.Integer(required=False, metadata={"description": "The chart ID"})
    form_data = fields.String(
        required=True,
        allow_none=False,
        metadata={"description": "Any type of JSON supported text."},
    )


class FormDataPutSchema(Schema):
    datasource_id = fields.Integer(
        required=True, allow_none=False, metadata={"description": "The datasource ID"}
    )
    datasource_type = fields.String(
        required=True,
        allow_none=False,
        metadata={"description": "The datasource type"},
        validate=validate.OneOf(choices=[ds.value for ds in DatasourceType]),
    )
    chart_id = fields.Integer(required=False, metadata={"description": "The chart ID"})
    form_data = fields.String(
        required=True,
        allow_none=False,
        metadata={"description": "Any type of JSON supported text."},
    )
