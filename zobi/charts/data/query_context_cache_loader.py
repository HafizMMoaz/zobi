from typing import Any

from zobi import cache
from zobi.commands.chart.exceptions import ChartDataCacheLoadError


class QueryContextCacheLoader:  # pylint: disable=too-few-public-methods
    @staticmethod
    def load(cache_key: str) -> dict[str, Any]:
        cache_value = cache.get(cache_key)
        if not cache_value:
            raise ChartDataCacheLoadError("Cached data not found")

        return cache_value["data"]
