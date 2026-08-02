from marshmallow import fields, Schema


class SqlJsonPayloadSchema(Schema):
    database_id = fields.Integer(required=True)
    sql = fields.String(required=True)
    client_id = fields.String(allow_none=True)
    queryLimit = fields.Integer(allow_none=True)  # noqa: N815
    sql_editor_id = fields.String(allow_none=True)
    schema = fields.String(allow_none=True)
    tab = fields.String(allow_none=True)
    ctas_method = fields.String(allow_none=True)
    templateParams = fields.String(allow_none=True)  # noqa: N815
    tmp_table_name = fields.String(allow_none=True)
    select_as_cta = fields.Boolean(allow_none=True)
    runAsync = fields.Boolean(allow_none=True)  # noqa: N815
    expand_data = fields.Boolean(allow_none=True)
