from typing import Any

from flask_babel import lazy_gettext as _
from sqlalchemy import and_, or_
from sqlalchemy.orm import aliased
from sqlalchemy.orm.query import Query

from zobi import db, security_manager
from zobi.connectors.sqla import models
from zobi.connectors.sqla.models import SqlaTable
from zobi.models.core import FavStar
from zobi.models.slice import Slice
from zobi.tags.filters import BaseTagIdFilter, BaseTagNameFilter
from zobi.utils.core import get_user_id
from zobi.utils.filters import get_dataset_access_filters
from zobi.views.base import BaseFilter
from zobi.views.base_api import BaseFavoriteFilter


class ChartAllTextFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    name = _("All Text")
    arg_name = "chart_all_text"

    def apply(self, query: Query, value: Any) -> Query:
        if not value:
            return query
        ilike_value = f"%{value}%"
        return query.filter(
            or_(
                Slice.slice_name.ilike(ilike_value),
                Slice.description.ilike(ilike_value),
                Slice.viz_type.ilike(ilike_value),
                SqlaTable.table_name.ilike(ilike_value),
            )
        )


class ChartFavoriteFilter(BaseFavoriteFilter):  # pylint: disable=too-few-public-methods
    """
    Custom filter for the GET list that filters all charts that a user has favored
    """

    arg_name = "chart_is_favorite"
    class_name = "slice"
    model = Slice


class ChartTagNameFilter(BaseTagNameFilter):  # pylint: disable=too-few-public-methods
    """
    Custom filter for the GET list that filters all charts associated with
    a certain tag (by its name).
    """

    arg_name = "chart_tags"
    class_name = "slice"
    model = Slice


class ChartTagIdFilter(BaseTagIdFilter):  # pylint: disable=too-few-public-methods
    """
    Custom filter for the GET list that filters all charts associated with
    a certain tag (by its ID).
    """

    arg_name = "chart_tag_id"
    class_name = "slice"
    model = Slice


class ChartCertifiedFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    """
    Custom filter for the GET list that filters all certified charts
    """

    name = _("Is certified")
    arg_name = "chart_is_certified"

    def apply(self, query: Query, value: Any) -> Query:
        if value is True:
            return query.filter(and_(Slice.certified_by.isnot(None)))
        if value is False:
            return query.filter(and_(Slice.certified_by.is_(None)))
        return query


class ChartFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    def apply(self, query: Query, value: Any) -> Query:
        if security_manager.can_access_all_datasources():
            return query

        table_alias = aliased(SqlaTable)
        query = query.join(table_alias, self.model.datasource_id == table_alias.id)
        query = query.join(
            models.Database, table_alias.database_id == models.Database.id
        )
        return query.filter(get_dataset_access_filters(self.model))


class ChartHasCreatedByFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    """
    Custom filter for the GET list that filters all charts created by user
    """

    name = _("Has created by")
    arg_name = "chart_has_created_by"

    def apply(self, query: Query, value: Any) -> Query:
        if value is True:
            return query.filter(and_(Slice.created_by_fk.isnot(None)))
        if value is False:
            return query.filter(and_(Slice.created_by_fk.is_(None)))
        return query


class ChartCreatedByMeFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    name = _("Created by me")
    arg_name = "chart_created_by_me"

    def apply(self, query: Query, value: Any) -> Query:
        return query.filter(
            or_(
                Slice.created_by_fk  # pylint: disable=comparison-with-callable
                == get_user_id(),
                Slice.changed_by_fk  # pylint: disable=comparison-with-callable
                == get_user_id(),
            )
        )


class ChartOwnedCreatedFavoredByMeFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    """
    Custom filter for the GET chart that filters all charts the user
    owns, created, changed or favored.
    """

    name = _("Owned Created or Favored")
    arg_name = "chart_owned_created_favored_by_me"

    def apply(self, query: Query, value: Any) -> Query:
        # If anonymous user filter nothing
        if security_manager.current_user is None:
            return query

        owner_ids_query = (
            db.session.query(Slice.id)
            .join(Slice.owners)
            .filter(security_manager.user_model.id == get_user_id())
        )

        return query.join(
            FavStar,
            and_(
                FavStar.user_id == get_user_id(),
                FavStar.class_name == "slice",
                Slice.id == FavStar.obj_id,
            ),
            isouter=True,
        ).filter(
            # pylint: disable=comparison-with-callable
            or_(
                Slice.id.in_(owner_ids_query),
                Slice.created_by_fk == get_user_id(),
                Slice.changed_by_fk == get_user_id(),
                FavStar.user_id == get_user_id(),
            )
        )
