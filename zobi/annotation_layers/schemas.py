from marshmallow import fields, Schema
from marshmallow.validate import Length

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

annotation_layer_name = "The annotation layer name"
annotation_layer_descr = "Give a description for this annotation layer"


class AnnotationLayerPostSchema(Schema):
    name = fields.String(
        metadata={"description": annotation_layer_name},
        required=True,
        validate=[Length(1, 250)],
    )
    descr = fields.String(
        metadata={"description": annotation_layer_descr}, allow_none=True
    )


class AnnotationLayerPutSchema(Schema):
    name = fields.String(
        metadata={"description": annotation_layer_name},
        required=False,
        validate=[Length(1, 250)],
    )
    descr = fields.String(
        metadata={"description": annotation_layer_descr}, required=False
    )
