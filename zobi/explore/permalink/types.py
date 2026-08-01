from typing import Any, Optional, TypedDict


class ExplorePermalinkState(TypedDict, total=False):
    formData: dict[str, Any]
    urlParams: Optional[list[tuple[str, str]]]
    chartState: Optional[dict[str, Any]]


class ExplorePermalinkValue(TypedDict):
    chartId: Optional[int]
    # either datasetId or datasourceId is required
    # TODO: deprecated - datasetId is deprecated
    # and should be removed in next major release
    datasetId: Optional[int]
    datasourceId: Optional[int]
    datasourceType: str
    datasource: str
    state: ExplorePermalinkState
