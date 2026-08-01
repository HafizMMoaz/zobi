from dataclasses import dataclass
from typing import Optional

from zobi.utils.core import DatasourceType


@dataclass
class CommandParameters:
    datasource_type: DatasourceType = DatasourceType.TABLE
    datasource_id: int = 0
    chart_id: int = 0
    tab_id: Optional[int] = None
    key: Optional[str] = None
    form_data: Optional[str] = None
