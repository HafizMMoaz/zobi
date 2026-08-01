# RISON/JSON schemas for query parameters
from marshmallow import fields, Schema, validate

from zobi.charts.schemas import (
    datasource_name_description,
    datasource_type_description,
    datasource_uid_description,
)
from zobi.utils.core import DatasourceType


class Datasource(Schema):
    database_name = fields.String(
        metadata={"description": "Datasource name"},
    )
    datasource_name = fields.String(
        metadata={"description": datasource_name_description},
    )
    catalog = fields.String(
        allow_none=True,
        metadata={"description": "Datasource catalog"},
    )
    schema = fields.String(
        metadata={"description": "Datasource schema"},
    )
    datasource_type = fields.String(
        metadata={"description": datasource_type_description},
        validate=validate.OneOf(choices=[ds.value for ds in DatasourceType]),
        required=True,
    )


class CacheInvalidationRequestSchema(Schema):
    datasource_uids = fields.List(
        fields.String(),
        metadata={"description": datasource_uid_description},
    )
    datasources = fields.List(
        fields.Nested(Datasource),
        metadata={"description": "A list of the data source and database names"},
    )
