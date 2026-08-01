from marshmallow import fields, Schema

get_recent_activity_schema = {
    "type": "object",
    "properties": {
        "page": {"type": "number"},
        "page_size": {"type": "number"},
        "actions": {"type": "array", "items": {"type": "string"}},
        "distinct": {"type": "boolean"},
    },
}

openapi_spec_methods_override = {
    "get": {"get": {"summary": "Get a log detail information"}},
    "get_list": {
        "get": {
            "summary": "Get a list of logs",
            "description": "Gets a list of logs, use Rison or JSON query "
            "parameters for filtering, sorting, pagination and "
            " for selecting specific columns and metadata.",
        }
    },
}


class RecentActivitySchema(Schema):
    action = fields.String(
        metadata={"description": "Action taken describing type of activity"}
    )
    item_type = fields.String(
        metadata={"description": "Type of item, e.g. slice or dashboard"}
    )
    item_url = fields.String(metadata={"description": "URL to item"})
    item_title = fields.String(metadata={"description": "Title of item"})
    time = fields.Float(
        metadata={"description": "Time of activity, in epoch milliseconds"}
    )
    time_delta_humanized = fields.String(
        metadata={
            "description": "Human-readable description of how long ago activity took "
            "place."
        }
    )


class RecentActivityResponseSchema(Schema):
    result = fields.List(
        fields.Nested(RecentActivitySchema),
        metadata={"description": "A list of recent activity objects"},
    )
