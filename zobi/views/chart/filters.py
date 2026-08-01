from typing import Any

from sqlalchemy.orm.query import Query

from zobi import security_manager
from zobi.utils.filters import get_dataset_access_filters
from zobi.views.base import BaseFilter


class SliceFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    def apply(self, query: Query, value: Any) -> Query:
        if security_manager.can_access_all_datasources():
            return query

        return query.filter(get_dataset_access_filters(self.model))
