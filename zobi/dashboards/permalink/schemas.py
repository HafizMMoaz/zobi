from marshmallow import fields, Schema


class DashboardPermalinkStateSchema(Schema):
    dataMask = fields.Dict(  # noqa: N815
        required=False,
        allow_none=True,
        metadata={"description": "Data mask used for native filter state"},
    )
    activeTabs = fields.List(  # noqa: N815
        fields.String(),
        required=False,
        allow_none=True,
        metadata={"description": "Current active dashboard tabs"},
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
    anchor = fields.String(
        required=False,
        allow_none=True,
        metadata={"description": "Optional anchor link added to url hash"},
    )
    chartStates = fields.Dict(  # noqa: N815
        required=False,
        allow_none=True,
        metadata={
            "description": (
                "Chart-level state for stateful tables "
                "(column order, sorting, filtering)"
            )
        },
    )


class DashboardPermalinkSchema(Schema):
    dashboardId = fields.String(  # noqa: N815
        required=True,
        allow_none=False,
        metadata={"description": "The id or slug of the dashboard"},
    )
    state = fields.Nested(DashboardPermalinkStateSchema())
