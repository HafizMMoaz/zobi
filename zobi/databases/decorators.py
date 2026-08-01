import functools
import logging
from typing import Any, Callable, Optional

from flask import g
from flask_babel import lazy_gettext as _

from zobi.extensions import stats_logger_manager
from zobi.models.core import Database
from zobi.sql.parse import Table
from zobi.utils.core import parse_js_uri_path_item
from zobi.views.base_api import BaseZobiModelRestApi

logger = logging.getLogger(__name__)


def check_table_access(f: Callable[..., Any]) -> Callable[..., Any]:
    """
    A Decorator that checks if a user has access to a table in a database.
    """

    def wraps(
        self: BaseZobiModelRestApi,
        pk: int,
        table_name: str,
        schema_name: Optional[str] = None,
    ) -> Any:
        schema_name_parsed = parse_js_uri_path_item(schema_name, eval_undefined=True)
        table_name_parsed = parse_js_uri_path_item(table_name)
        if not table_name_parsed:
            return self.response_422(message=_("Table name undefined"))
        database: Database = self.datamodel.get(pk)
        if not database:
            stats_logger_manager.instance.incr(
                f"database_not_found_{self.__class__.__name__}.select_star"
            )
            return self.response_404()
        if not self.appbuilder.sm.can_access_table(
            database, Table(table_name_parsed, schema_name_parsed)
        ):
            stats_logger_manager.instance.incr(
                f"permission_denied_{self.__class__.__name__}.select_star"
            )
            logger.warning(
                "Permission denied for user %s on table: %s schema: %s",
                g.user,
                table_name_parsed,
                schema_name_parsed,
            )
            return self.response_404()
        return f(self, database, table_name_parsed, schema_name_parsed)

    return functools.update_wrapper(wraps, f)
