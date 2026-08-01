from marshmallow import fields, Schema


class SemanticViewPutSchema(Schema):
    description = fields.String(allow_none=True)
    cache_timeout = fields.Integer(allow_none=True)


class SemanticLayerPostSchema(Schema):
    name = fields.String(required=True)
    description = fields.String(allow_none=True)
    type = fields.String(required=True)
    configuration = fields.Dict(required=True)
    cache_timeout = fields.Integer(allow_none=True)


class SemanticLayerPutSchema(Schema):
    name = fields.String()
    description = fields.String(allow_none=True)
    configuration = fields.Dict()
    cache_timeout = fields.Integer(allow_none=True)


class SemanticViewPostSchema(Schema):
    name = fields.String(required=True)
    semantic_layer_uuid = fields.String(required=True)
    configuration = fields.Dict(load_default=dict)
    description = fields.String(allow_none=True)
    cache_timeout = fields.Integer(allow_none=True)
