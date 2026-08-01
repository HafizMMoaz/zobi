from marshmallow import fields, Schema


class SqlLabPermalinkSchema(Schema):
    autorun = fields.Boolean()
    dbId = fields.Integer(  # noqa: N815
        required=True,
        allow_none=False,
        metadata={"description": "The id of the database"},
    )
    name = fields.String(
        required=True,
        allow_none=False,
        metadata={"description": "The label of the editor tab"},
    )
    schema = fields.String(
        required=False,
        allow_none=True,
        metadata={"description": "The schema name of the query"},
    )
    catalog = fields.String(
        required=False,
        allow_none=True,
        metadata={"description": "The catalog name of the query"},
    )
    sql = fields.String(
        required=True,
        allow_none=False,
        metadata={"description": "SQL query text"},
    )
    templateParams = fields.String(  # noqa: N815
        required=False,
        allow_none=True,
        metadata={"description": "stringfied JSON string for template parameters"},
    )
