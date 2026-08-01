
# Field has been moved outside of the schemas.py file to
# allow for it to be imported from outside of app_context
from marshmallow import fields


class EncryptedField:  # pylint: disable=too-few-public-methods
    """
    A database field that should be stored in encrypted_extra.
    """


class EncryptedString(EncryptedField, fields.String):
    pass


class EncryptedDict(EncryptedField, fields.Dict):
    pass
