"""
Schemas for advanced data types
"""

from marshmallow import fields, Schema

advanced_data_type_convert_schema = {
    "type": "object",
    "properties": {
        "type": {"type": "string", "default": "port"},
        "values": {
            "type": "array",
            "items": {"default": "http"},
            "minItems": 1,
        },
    },
    "required": ["type", "values"],
}


class AdvancedDataTypeSchema(Schema):
    """
    AdvancedDataType response schema
    """

    error_message = fields.String()
    values = fields.List(
        fields.String(metadata={"description": "parsed value (can be any value)"})
    )
    display_value = fields.String(
        metadata={"description": "The string representation of the parsed values"}
    )
    valid_filter_operators = fields.List(fields.String())
