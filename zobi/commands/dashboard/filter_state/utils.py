
from zobi.commands.dashboard.exceptions import (
    DashboardAccessDeniedError,
    DashboardNotFoundError,
)
from zobi.commands.temporary_cache.exceptions import (
    TemporaryCacheAccessDeniedError,
    TemporaryCacheResourceNotFoundError,
)
from zobi.daos.dashboard import DashboardDAO


def check_access(resource_id: int) -> None:
    try:
        DashboardDAO.get_by_id_or_slug(str(resource_id))
    except DashboardNotFoundError as ex:
        raise TemporaryCacheResourceNotFoundError from ex
    except DashboardAccessDeniedError as ex:
        raise TemporaryCacheAccessDeniedError from ex
