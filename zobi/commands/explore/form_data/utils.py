from typing import Optional

from zobi.commands.chart.exceptions import (
    ChartAccessDeniedError,
    ChartNotFoundError,
)
from zobi.commands.dataset.exceptions import (
    DatasetAccessDeniedError,
    DatasetNotFoundError,
)
from zobi.commands.temporary_cache.exceptions import (
    TemporaryCacheAccessDeniedError,
    TemporaryCacheResourceNotFoundError,
)
from zobi.explore.utils import check_access as explore_check_access
from zobi.utils.core import DatasourceType


def check_access(
    datasource_id: int,
    chart_id: Optional[int],
    datasource_type: DatasourceType,
) -> None:
    try:
        explore_check_access(datasource_id, chart_id, datasource_type)
    except (ChartNotFoundError, DatasetNotFoundError) as ex:
        raise TemporaryCacheResourceNotFoundError from ex
    except (ChartAccessDeniedError, DatasetAccessDeniedError) as ex:
        raise TemporaryCacheAccessDeniedError from ex
