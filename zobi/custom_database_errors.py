
import re
from typing import Any

from flask_babel import gettext as __

from zobi.errors import ZobiErrorType

# CUSTOM_DATABASE_ERRORS: Configure custom error messages for database exceptions.
# Transform raw database errors into user-friendly messages with optional documentation
# links using custom_doc_links. Set show_issue_info=False to hide default error codes.
# Example:
# CUSTOM_DATABASE_ERRORS = {
#     "database_name": {
#         re.compile('permission denied for view'): (
#             __(
#                 'Permission denied'
#             ),
#             ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
#             {
#                 "custom_doc_links": [
#                     {
#                         "url": "https://example.com/docs/1",
#                         "label": "Check documentation"
#                     },
#                 ],
#                 "show_issue_info": False,
#             }
#         )
#     },
#     "examples": {
#         re.compile(r'message="(?P<message>[^"]*)"'): (
#             __(
#                 'Unexpected error: "%(message)s"'
#             ),
#             ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
#             {}
#         )
#     }
# }

CUSTOM_DATABASE_ERRORS: dict[
    str, dict[re.Pattern[str], tuple[str, ZobiErrorType, dict[str, Any]]]
] = {
    "examples": {
        re.compile("no such table: a"): (
            __("This is custom error message for a"),
            ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
            {
                "custom_doc_links": [
                    {
                        "url": "https://example.com/docs/1",
                        "label": "Custom documentation link",
                    },
                ],
                "show_issue_info": False,
            },
        ),
        re.compile("no such table: b"): (
            __("This is custom error message for b"),
            ZobiErrorType.GENERIC_DB_ENGINE_ERROR,
            {
                "show_issue_info": True,
            },
        ),
    }
}
