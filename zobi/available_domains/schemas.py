from marshmallow import fields, Schema


class AvailableDomainsSchema(Schema):
    domains = fields.List(fields.String())
