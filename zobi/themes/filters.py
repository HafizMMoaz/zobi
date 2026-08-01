from typing import Any

from flask_babel import lazy_gettext as _
from sqlalchemy import or_
from sqlalchemy.orm.query import Query

from zobi.models.core import Theme
from zobi.views.base import BaseFilter


class ThemeAllTextFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    name = _("All Text")
    arg_name = "theme_all_text"

    def apply(self, query: Query, value: Any) -> Query:
        if not value:
            return query
        ilike_value = f"%{value}%"
        return query.filter(
            or_(
                Theme.theme_name.ilike(ilike_value),
                Theme.json_data.ilike(ilike_value),
            )
        )
