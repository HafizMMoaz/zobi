from flask_appbuilder.security.sqla.apis.user.schema import User
from flask_appbuilder.security.sqla.apis.user.validator import (
    PasswordComplexityValidator,
)
from marshmallow import fields, Schema
from marshmallow.fields import Boolean, Integer, String
from marshmallow.validate import Length

first_name_description = "The current user's first name"
last_name_description = "The current user's last name"
password_description = "The current user's password for authentication"  # noqa: S105


class UserResponseSchema(Schema):
    id = Integer()
    username = String()
    email = String()
    first_name = String()
    last_name = String()
    is_active = Boolean()
    is_anonymous = Boolean()
    login_count = Integer()


class CurrentUserPutSchema(Schema):
    model_cls = User

    first_name = fields.String(
        required=False,
        metadata={"description": first_name_description},
        validate=[Length(1, 64)],
    )
    last_name = fields.String(
        required=False,
        metadata={"description": last_name_description},
        validate=[Length(1, 64)],
    )
    password = fields.String(
        required=False,
        validate=[PasswordComplexityValidator()],
        metadata={"description": password_description},
    )
