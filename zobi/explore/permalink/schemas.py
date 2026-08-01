from marshmallow import fields, Schema


class ExplorePermalinkStateSchema(Schema):
    formData = fields.Dict(  # noqa: N815
        required=True,
        allow_none=False,
        metadata={"description": "Chart form data"},
    )
    urlParams = fields.List(  # noqa: N815
        fields.Tuple(
            (
                fields.String(
                    required=True, allow_none=True, metadata={"description": "Key"}
                ),
                fields.String(
                    required=True, allow_none=True, metadata={"description": "Value"}
                ),
            ),
            required=False,
            allow_none=True,
            metadata={"description": "URL Parameter key-value pair"},
        ),
        required=False,
        allow_none=True,
        metadata={"description": "URL Parameters"},
    )
    chartState = fields.Dict(  # noqa: N815
        required=False,
        allow_none=True,
        metadata={
            "description": (
                "Chart-level state for stateful tables "
                "(column filters, sorting, column order)"
            )
        },
    )


class ExplorePermalinkSchema(Schema):
    chartId = fields.Integer(  # noqa: N815
        required=False,
        allow_none=True,
        metadata={"description": "The id of the chart"},
    )
    datasourceType = fields.String(  # noqa: N815
        required=True,
        allow_none=False,
        metadata={"description": "The type of the datasource"},
    )
    datasourceId = fields.Integer(  # noqa: N815
        required=False,
        allow_none=True,
        metadata={"description": "The id of the datasource"},
    )
    datasource = fields.String(
        required=False,
        allow_none=True,
        metadata={"description": "The fully qualified datasource reference"},
    )
    state = fields.Nested(ExplorePermalinkStateSchema())
