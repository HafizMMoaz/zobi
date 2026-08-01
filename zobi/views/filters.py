import logging
from typing import Any, cast, Optional

from flask import current_app as app
from flask_appbuilder.models.filters import BaseFilter
from flask_babel import lazy_gettext
from sqlalchemy import and_, or_
from sqlalchemy.orm import Query

from zobi import security_manager

logger = logging.getLogger(__name__)


class FilterRelatedOwners(BaseFilter):  # pylint: disable=too-few-public-methods
    """
    A filter to allow searching for related owners of a resource.

    Use in the api by adding something like:
    related_field_filters = {
      "owners": RelatedFieldFilter("first_name", FilterRelatedOwners),
    }
    """

    name = lazy_gettext("Owner")
    arg_name = "owners"

    def apply(self, query: Query, value: Optional[Any]) -> Query:
        user_model = security_manager.user_model
        like_value = "%" + cast(str, value) + "%"
        return query.filter(
            or_(
                # could be made to handle spaces between names more gracefully
                (user_model.first_name + " " + user_model.last_name).ilike(like_value),
                user_model.username.ilike(like_value),
            )
        )


class BaseFilterRelatedUsers(BaseFilter):  # pylint: disable=too-few-public-methods
    """
    Filter to apply on related users. Will exclude users in EXCLUDE_USERS_FROM_LISTS

    Use in the api by adding something like:
    ```
    base_related_field_filters = {
        "owners": [["id", BaseFilterRelatedUsers, lambda: []]],
        "created_by": [["id", BaseFilterRelatedUsers, lambda: []]],
    }
    ```
    """

    name = lazy_gettext("username")
    arg_name = "username"

    def apply(self, query: Query, value: Optional[Any]) -> Query:
        if extra_filters := app.config["EXTRA_RELATED_QUERY_FILTERS"].get(
            "user",
        ):
            query = extra_filters(query)

        exclude_users = (
            security_manager.get_exclude_users_from_lists()
            if app.config["EXCLUDE_USERS_FROM_LISTS"] is None
            else app.config["EXCLUDE_USERS_FROM_LISTS"]
        )
        if exclude_users:
            user_model = security_manager.user_model
            return query.filter(and_(user_model.username.not_in(exclude_users)))

        return query


class BaseFilterRelatedRoles(BaseFilter):  # pylint: disable=too-few-public-methods
    """
    Filter to apply on related roles.
    """

    name = lazy_gettext("role")
    arg_name = "role"

    def apply(self, query: Query, value: Optional[Any]) -> Query:
        if extra_filters := app.config["EXTRA_RELATED_QUERY_FILTERS"].get(
            "role",
        ):
            return extra_filters(query)

        return query


class FilterRelatedTables(BaseFilter):  # pylint: disable=too-few-public-methods
    """
    A filter to allow searching for related tables.
    Use in the api by adding something like:
    related_field_filters = {
      "tables": RelatedFieldFilter("table_name", FilterRelatedTables),
    }
    """

    name = lazy_gettext("Table")
    arg_name = "tables"

    def apply(self, query: Query, value: Optional[Any]) -> Query:
        from zobi.connectors.sqla.models import SqlaTable

        like_value = "%" + cast(str, value) + "%"
        return query.filter(SqlaTable.table_name.ilike(like_value))
