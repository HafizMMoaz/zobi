from typing import Any

from flask_babel import lazy_gettext as _
from sqlalchemy import or_
from sqlalchemy.orm.query import Query

from zobi.models.annotations import Annotation
from zobi.views.base import BaseFilter


class AnnotationAllTextFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    name = _("All Text")
    arg_name = "annotation_all_text"

    def apply(self, query: Query, value: Any) -> Query:
        if not value:
            return query
        ilike_value = f"%{value}%"
        return query.filter(
            or_(
                Annotation.short_descr.ilike(ilike_value),
                Annotation.long_descr.ilike(ilike_value),
            )
        )
