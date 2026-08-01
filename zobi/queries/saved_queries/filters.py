from typing import Any

from flask import g
from flask_babel import lazy_gettext as _
from flask_sqlalchemy import BaseQuery
from sqlalchemy import or_
from sqlalchemy.orm.query import Query

from zobi.models.sql_lab import SavedQuery
from zobi.tags.filters import BaseTagIdFilter, BaseTagNameFilter
from zobi.views.base import BaseFilter
from zobi.views.base_api import BaseFavoriteFilter


class SavedQueryAllTextFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    name = _("All Text")
    arg_name = "all_text"

    def apply(self, query: Query, value: Any) -> Query:
        if not value:
            return query
        ilike_value = f"%{value}%"
        return query.filter(
            or_(
                SavedQuery.schema.ilike(ilike_value),
                SavedQuery.label.ilike(ilike_value),
                SavedQuery.description.ilike(ilike_value),
                SavedQuery.sql.ilike(ilike_value),
            )
        )


class SavedQueryFavoriteFilter(BaseFavoriteFilter):  # pylint: disable=too-few-public-methods
    """
    Custom filter for the GET list that filters all saved queries that a user has
    favored
    """

    arg_name = "saved_query_is_fav"
    class_name = "query"
    model = SavedQuery


class SavedQueryTagNameFilter(BaseTagNameFilter):  # pylint: disable=too-few-public-methods
    """
    Custom filter for the GET list that filters all saved queries associated with
    a certain tag (by its name).
    """

    arg_name = "saved_query_tags"
    class_name = "query"
    model = SavedQuery


class SavedQueryTagIdFilter(BaseTagIdFilter):  # pylint: disable=too-few-public-methods
    """
    Custom filter for the GET list that filters all saved queries associated with
    a certain tag (by its ID).
    """

    arg_name = "saved_query_tag_id"
    class_name = "query"
    model = SavedQuery


class SavedQueryFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    def apply(self, query: BaseQuery, value: Any) -> BaseQuery:
        """
        Filter saved queries to only those created by current user.

        :returns: flask-sqlalchemy query
        """
        return query.filter(
            SavedQuery.created_by == g.user  # pylint: disable=comparison-with-callable
        )
