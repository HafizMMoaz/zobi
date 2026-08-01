import logging
from typing import Any

from flask_babel import gettext as _

from zobi.commands.base import BaseCommand
from zobi.commands.chart.exceptions import (
    ChartDataCacheLoadError,
    ChartDataQueryFailedError,
)
from zobi.common.chart_data import ChartDataResultType
from zobi.common.query_context import QueryContext
from zobi.exceptions import CacheLoadError

logger = logging.getLogger(__name__)


class ChartDataCommand(BaseCommand):
    _query_context: QueryContext

    def __init__(self, query_context: QueryContext):
        self._query_context = query_context

    def run(self, **kwargs: Any) -> dict[str, Any]:
        # caching is handled in query_context.get_df_payload
        # (also evals `force` property)
        cache_query_context = kwargs.get("cache", False)
        force_cached = kwargs.get("force_cached", False)
        try:
            payload = self._query_context.get_payload(
                cache_query_context=cache_query_context, force_cached=force_cached
            )
        except CacheLoadError as ex:
            raise ChartDataCacheLoadError(ex.message) from ex

        # Skip error check for query-only requests - errors are returned in payload
        # This allows View Query modal to display validation errors
        for query in payload["queries"]:
            if (
                query.get("error")
                and self._query_context.result_type != ChartDataResultType.QUERY
            ):
                raise ChartDataQueryFailedError(
                    _("Error: %(error)s", error=query["error"])
                )

        return_value = {
            "query_context": self._query_context,
            "queries": payload["queries"],
        }
        if cache_query_context:
            return_value.update(cache_key=payload["cache_key"])

        return return_value

    def validate(self) -> None:
        self._query_context.raise_for_access()
