import re

from flask_babel import lazy_gettext as _
from sqlalchemy.engine.url import URL
from sqlalchemy.exc import NoSuchModuleError

from zobi import feature_flag_manager
from zobi.errors import ErrorLevel, ZobiError, ZobiErrorType
from zobi.exceptions import ZobiSecurityException

# list of unsafe SQLAlchemy dialects
BLOCKLIST = {
    # sqlite creates a local DB, which allows mapping server's filesystem
    re.compile(r"sqlite(?:\+[^\s]*)?$"),
    # shillelagh allows opening local files (eg, 'SELECT * FROM "csv:///etc/passwd"')
    re.compile(r"shillelagh(?:\+[^\s]*)?$"),
}


def check_sqlalchemy_uri(uri: URL) -> None:
    if not feature_flag_manager.is_feature_enabled("ENABLE_ZOBI_META_DB"):
        BLOCKLIST.add(re.compile(r"zobi$"))

    for blocklist_regex in BLOCKLIST:
        if not re.match(blocklist_regex, uri.drivername):
            continue
        try:
            dialect = uri.get_dialect().__name__
        except (NoSuchModuleError, ValueError):
            dialect = uri.drivername

        raise ZobiSecurityException(
            ZobiError(
                error_type=ZobiErrorType.DATABASE_SECURITY_ACCESS_ERROR,
                message=_(
                    "%(dialect)s cannot be used as a data source for security reasons.",
                    dialect=dialect,
                ),
                level=ErrorLevel.ERROR,
            )
        )
