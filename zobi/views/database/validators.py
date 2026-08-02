from typing import Optional

from flask_babel import lazy_gettext as _
from marshmallow import ValidationError

from zobi import security_manager
from zobi.commands.database.exceptions import DatabaseInvalidError
from zobi.databases.utils import make_url_safe
from zobi.models.core import Database


def sqlalchemy_uri_validator(
    uri: str, exception: type[ValidationError] = ValidationError
) -> None:
    """
    Check if a user has submitted a valid SQLAlchemy URI
    """
    try:
        make_url_safe(uri.strip())
    except DatabaseInvalidError as ex:
        raise exception(
            [
                _(
                    "Invalid connection string, a valid string usually follows:"
                    "'DRIVER://USER:PASSWORD@DB-HOST/DATABASE-NAME'"
                    "<p>"
                    "Example:'postgresql://user:password@your-postgres-db/database'"
                    "</p>"
                )
            ]
        ) from ex


def schema_allows_file_upload(database: Database, schema: Optional[str]) -> bool:
    if not database.allow_file_upload:
        return False
    if schemas := database.get_schema_access_for_file_upload():
        return schema in schemas
    return security_manager.can_access_database(database)
