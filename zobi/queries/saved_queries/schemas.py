from marshmallow import fields, Schema
from marshmallow.validate import Length

openapi_spec_methods_override = {
    "get": {"get": {"summary": "Get a saved query"}},
    "get_list": {
        "get": {
            "summary": "Get a list of saved queries",
            "description": "Gets a list of saved queries, use Rison or JSON "
            "query parameters for filtering, sorting,"
            " pagination and for selecting specific"
            " columns and metadata.",
        }
    },
    "post": {"post": {"summary": "Create a saved query"}},
    "put": {"put": {"summary": "Update a saved query"}},
    "delete": {"delete": {"summary": "Delete a saved query"}},
    "info": {"get": {"summary": "Get metadata information about this API resource"}},
}

get_delete_ids_schema = {"type": "array", "items": {"type": "integer"}}
get_export_ids_schema = {"type": "array", "items": {"type": "integer"}}


class ImportV1SavedQuerySchema(Schema):
    catalog = fields.String(allow_none=True, validate=Length(0, 128))
    schema = fields.String(allow_none=True, validate=Length(0, 128))
    label = fields.String(allow_none=True, validate=Length(0, 256))
    description = fields.String(allow_none=True)
    sql = fields.String(required=True)
    uuid = fields.UUID(required=True)
    version = fields.String(required=True)
    database_uuid = fields.UUID(required=True)
