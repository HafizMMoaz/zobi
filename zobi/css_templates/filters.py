from typing import Any

from flask_babel import lazy_gettext as _
from sqlalchemy import or_
from sqlalchemy.orm.query import Query

from zobi.models.core import CssTemplate
from zobi.views.base import BaseFilter


class CssTemplateAllTextFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    name = _("All Text")
    arg_name = "css_template_all_text"

    def apply(self, query: Query, value: Any) -> Query:
        if not value:
            return query
        ilike_value = f"%{value}%"
        return query.filter(
            or_(
                CssTemplate.template_name.ilike(ilike_value),
                CssTemplate.css.ilike(ilike_value),
            )
        )
