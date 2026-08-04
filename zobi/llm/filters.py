from typing import Any

from flask_babel import lazy_gettext as _
from sqlalchemy import or_
from sqlalchemy.orm.query import Query

from zobi.models.llm import LLMModel, LLMProvider
from zobi.views.base import BaseFilter


class LLMProviderAllTextFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    name = _("All Text")
    arg_name = "llm_provider_all_text"

    def apply(self, query: Query, value: Any) -> Query:
        if not value:
            return query
        ilike_value = f"%{value}%"
        # Deliberately excludes `params`: it is admin-supplied connection
        # detail, and searching it would surface endpoint URLs in list results.
        return query.filter(
            or_(
                LLMProvider.name.ilike(ilike_value),
                LLMProvider.provider_key.ilike(ilike_value),
            )
        )


class LLMModelAllTextFilter(BaseFilter):  # pylint: disable=too-few-public-methods
    name = _("All Text")
    arg_name = "llm_model_all_text"

    def apply(self, query: Query, value: Any) -> Query:
        if not value:
            return query
        ilike_value = f"%{value}%"
        return query.filter(
            or_(
                LLMModel.alias.ilike(ilike_value),
                LLMModel.model_string.ilike(ilike_value),
            )
        )
