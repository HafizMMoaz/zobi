from typing import Any

from flask_sqlalchemy import BaseQuery

from zobi import security_manager
from zobi.models.sql_lab import Query
from zobi.utils.core import get_user_id
from zobi.views.base import BaseFilter


class QueryFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    def apply(self, query: BaseQuery, value: Any) -> BaseQuery:
        """
        Filter queries to only those owned by current user. If
        can_access_all_queries permission is set a user can list all queries

        :returns: query
        """
        if not security_manager.can_access_all_queries():
            query = query.filter(Query.user_id == get_user_id())
        return query
