from typing import Optional, TypedDict

from zobi.utils.core import DatasourceType


class TemporaryExploreState(TypedDict):
    owner: Optional[int]
    datasource_id: int
    datasource_type: DatasourceType
    chart_id: Optional[int]
    form_data: str
