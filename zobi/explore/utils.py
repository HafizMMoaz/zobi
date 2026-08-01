from typing import Optional

from zobi import security_manager
from zobi.commands.chart.exceptions import (
    ChartAccessDeniedError,
    ChartNotFoundError,
)
from zobi.commands.dataset.exceptions import (
    DatasetAccessDeniedError,
    DatasetNotFoundError,
)
from zobi.commands.exceptions import (
    DatasourceNotFoundValidationError,
    DatasourceTypeInvalidError,
    QueryNotFoundValidationError,
)
from zobi.daos.chart import ChartDAO
from zobi.daos.dataset import DatasetDAO
from zobi.daos.query import QueryDAO
from zobi.utils.core import DatasourceType


def check_dataset_access(dataset_id: int) -> Optional[bool]:
    if dataset_id:
        # Access checks below, no need to validate them twice as they can be expensive.
        dataset = DatasetDAO.find_by_id(dataset_id, skip_base_filter=True)
        if dataset:
            can_access_datasource = security_manager.can_access_datasource(dataset)
            if can_access_datasource:
                return True
            raise DatasetAccessDeniedError()
    raise DatasetNotFoundError()


def check_query_access(query_id: int) -> Optional[bool]:
    if query_id:
        # Access checks below, no need to validate them twice as they can be expensive.
        query = QueryDAO.find_by_id(query_id, skip_base_filter=True)
        if query:
            security_manager.raise_for_access(query=query)
            return True
    raise QueryNotFoundValidationError()


ACCESS_FUNCTION_MAP = {
    DatasourceType.TABLE: check_dataset_access,
    DatasourceType.QUERY: check_query_access,
}


def check_datasource_access(
    datasource_id: int, datasource_type: DatasourceType
) -> Optional[bool]:
    if datasource_id:
        try:
            return ACCESS_FUNCTION_MAP[datasource_type](datasource_id)
        except KeyError as ex:
            raise DatasourceTypeInvalidError() from ex
    raise DatasourceNotFoundValidationError()


def check_access(
    datasource_id: int,
    chart_id: Optional[int],
    datasource_type: DatasourceType,
) -> Optional[bool]:
    check_datasource_access(datasource_id, datasource_type)
    if not chart_id:
        return True
    # Access checks below, no need to validate them twice as they can be expensive.
    chart = ChartDAO.find_by_id(chart_id, skip_base_filter=True)
    if chart:
        can_access_chart = security_manager.is_owner(
            chart
        ) or security_manager.can_access("can_read", "Chart")
        if can_access_chart:
            return True
        raise ChartAccessDeniedError()
    raise ChartNotFoundError()
