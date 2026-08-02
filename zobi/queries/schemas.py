from marshmallow import fields, Schema

from zobi.dashboards.schemas import UserSchema
from zobi.models.sql_lab import Query
from zobi.sql.parse import Table

openapi_spec_methods_override = {
    "get": {"get": {"summary": "Get query detail information"}},
    "get_list": {
        "get": {
            "summary": "Get a list of queries",
            "description": "Gets a list of queries, use Rison or JSON query "
            "parameters for filtering, sorting, pagination and "
            " for selecting specific columns and metadata.",
        }
    },
}

queries_get_updated_since_schema = {
    "type": "object",
    "properties": {
        "last_updated_ms": {"type": "number"},
    },
    "required": ["last_updated_ms"],
}


class DatabaseSchema(Schema):
    database_name = fields.String()


class QuerySchema(Schema):
    """
    Schema for the ``Query`` model.
    """

    changed_on = fields.DateTime()
    database = fields.Nested(DatabaseSchema)
    end_time = fields.Float(attribute="end_time")
    executed_sql = fields.String()
    id = fields.Int()
    rows = fields.Int()
    schema = fields.String()
    sql = fields.String()
    sql_tables = fields.Method("get_sql_tables")
    start_running_time = fields.Float(attribute="start_running_time")
    start_time = fields.Float(attribute="start_time")
    status = fields.String()
    tab_name = fields.String()
    tmp_table_name = fields.String()
    tracking_url = fields.String()
    user = fields.Nested(UserSchema(exclude=["username"]))

    class Meta:  # pylint: disable=too-few-public-methods
        model = Query
        load_instance = True
        include_relationships = True

    def get_sql_tables(self, obj: Query) -> list[Table]:
        return obj.sql_tables


class StopQuerySchema(Schema):
    """
    Schema for the stop_query API call.
    """

    client_id = fields.String()
