from marshmallow import fields, Schema

from zobi.databases.schemas import ImportV1DatabaseSchema

sql_lab_get_results_schema = {
    "type": "object",
    "properties": {
        "key": {"type": "string"},
    },
    "required": ["key"],
}


class EstimateQueryCostSchema(Schema):
    database_id = fields.Integer(
        required=True, metadata={"description": "The database id"}
    )
    sql = fields.String(
        required=True, metadata={"description": "The SQL query to estimate"}
    )
    template_params = fields.Dict(
        keys=fields.String(), metadata={"description": "The SQL query template params"}
    )
    catalog = fields.String(
        allow_none=True, metadata={"description": "The database catalog"}
    )
    schema = fields.String(
        allow_none=True, metadata={"description": "The database schema"}
    )


class FormatQueryPayloadSchema(Schema):
    sql = fields.String(required=True)
    engine = fields.String(required=False, allow_none=True)
    database_id = fields.Integer(
        required=False, allow_none=True, metadata={"description": "The database id"}
    )
    template_params = fields.String(
        required=False,
        allow_none=True,
        metadata={"description": "The SQL query template params as JSON string"},
    )


class ExecutePayloadSchema(Schema):
    database_id = fields.Integer(required=True)
    sql = fields.String(required=True)
    client_id = fields.String(allow_none=True)
    queryLimit = fields.Integer(allow_none=True)  # noqa: N815
    sql_editor_id = fields.String(allow_none=True)
    catalog = fields.String(allow_none=True)
    schema = fields.String(allow_none=True)
    tab = fields.String(allow_none=True)
    ctas_method = fields.String(allow_none=True)
    templateParams = fields.String(allow_none=True)  # noqa: N815
    tmp_table_name = fields.String(allow_none=True)
    select_as_cta = fields.Boolean(allow_none=True)
    runAsync = fields.Boolean(allow_none=True)  # noqa: N815
    expand_data = fields.Boolean(allow_none=True)


class QueryResultSchema(Schema):
    changed_on = fields.DateTime()
    dbId = fields.Integer()  # noqa: N815
    db = fields.String()  # pylint: disable=disallowed-name
    endDttm = fields.Float()  # noqa: N815
    errorMessage = fields.String(allow_none=True)  # noqa: N815
    executedSql = fields.String()  # noqa: N815
    id = fields.String()
    queryId = fields.Integer()  # noqa: N815
    limit = fields.Integer()
    limitingFactor = fields.String()  # noqa: N815
    progress = fields.Integer()
    rows = fields.Integer()
    schema = fields.String()
    ctas = fields.Boolean()
    serverId = fields.Integer()  # noqa: N815
    sql = fields.String()
    sqlEditorId = fields.String()  # noqa: N815
    startDttm = fields.Float()  # noqa: N815
    state = fields.String()
    tab = fields.String()
    tempSchema = fields.String(allow_none=True)  # noqa: N815
    tempTable = fields.String(allow_none=True)  # noqa: N815
    userId = fields.Integer()  # noqa: N815
    user = fields.String()
    resultsKey = fields.String()  # noqa: N815
    trackingUrl = fields.String(allow_none=True)  # noqa: N815
    extra = fields.Dict(keys=fields.String())


class QueryExecutionResponseSchema(Schema):
    status = fields.String()
    data = fields.List(fields.Dict())
    columns = fields.List(fields.Dict())
    selected_columns = fields.List(fields.Dict())
    expanded_columns = fields.List(fields.Dict())
    query = fields.Nested(QueryResultSchema)
    query_id = fields.Integer()


class TableSchema(Schema):
    database_id = fields.Integer()
    description = fields.String()
    expanded = fields.Boolean()
    id = fields.Integer()
    schema = fields.String()
    tab_state_id = fields.Integer()
    table = fields.String()


class TabStateSchema(Schema):
    active = fields.Boolean()
    autorun = fields.Boolean()
    database_id = fields.Integer()
    extra_json = fields.Dict()
    hide_left_bar = fields.Boolean()
    id = fields.String()
    label = fields.String()
    latest_query = fields.Nested(QueryResultSchema)
    query_limit = fields.Integer()
    saved_query = fields.Dict(
        allow_none=True,
        metadata={"id": "SavedQuery id"},
    )
    schema = fields.String()
    sql = fields.String()
    table_schemas = fields.List(fields.Nested(TableSchema))
    user_id = fields.Integer()


class SQLLabBootstrapSchema(Schema):
    active_tab = fields.Nested(TabStateSchema)
    databases = fields.Dict(
        keys=fields.String(
            metadata={"description": "Database id"},
        ),
        values=fields.Nested(ImportV1DatabaseSchema),
    )
    queries = fields.Dict(
        keys=fields.String(
            metadata={"description": "Query id"},
        ),
        values=fields.Nested(QueryResultSchema),
    )
    tab_state_ids = fields.List(fields.String())
