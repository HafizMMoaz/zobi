from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from flask import current_app as app

from zobi import security_manager
from zobi.tasks.exceptions import ExecutorNotFoundError
from zobi.tasks.types import ExecutorType
from zobi.tasks.utils import get_current_user, get_executor
from zobi.utils.core import override_user
from zobi.utils.hashing import hash_from_str

if TYPE_CHECKING:
    from zobi.connectors.sqla.models import BaseDatasource, SqlaTable
    from zobi.models.dashboard import Dashboard
    from zobi.models.slice import Slice

logger = logging.getLogger(__name__)


def _adjust_string_for_executor(
    unique_string: str,
    executor_type: ExecutorType,
    executor: str,
) -> str:
    """
    Add the executor to the unique string if the thumbnail is
    user-specific.
    """
    if executor_type == ExecutorType.CURRENT_USER:
        # add the user id to the string to make it unique
        unique_string = f"{unique_string}\n{executor}"

    return unique_string


def _adjust_string_with_rls(
    unique_string: str,
    datasources: list[SqlaTable | None] | set[BaseDatasource],
    executor: str,
) -> str:
    """
    Add the RLS filters to the unique string based on current executor.
    """

    user = (
        security_manager.find_user(executor)
        or security_manager.get_current_guest_user_if_guest()
    )

    if user:
        stringified_rls = ""
        with override_user(user):
            # Prefetch RLS filters for all datasources in a single batch query
            table_ids = [
                datasource.id
                for datasource in datasources
                if datasource and getattr(datasource, "is_rls_supported", False)
            ]
            if table_ids:
                security_manager.prefetch_rls_filters(table_ids)

            for datasource in sorted(datasources, key=lambda d: d.id if d else -1):
                if datasource and getattr(datasource, "is_rls_supported", False):
                    rls_filters = datasource.get_sqla_row_level_filters()

                    if len(rls_filters) > 0:
                        stringified_rls += (
                            f"{str(datasource.id)}\t"
                            + "\t".join([str(f) for f in rls_filters])
                            + "\n"
                        )

        if stringified_rls:
            unique_string = f"{unique_string}\n{stringified_rls}"

    return unique_string


def get_dashboard_digest(dashboard: Dashboard) -> str | None:
    try:
        executor_type, executor = get_executor(
            executors=app.config["THUMBNAIL_EXECUTORS"],
            model=dashboard,
            current_user=get_current_user(),
        )
    except ExecutorNotFoundError:
        return None

    if func := app.config["THUMBNAIL_DASHBOARD_DIGEST_FUNC"]:
        return func(dashboard, executor_type, executor)

    unique_string = (
        f"{dashboard.id}\n{sorted(dashboard.charts)}\n{dashboard.position_json}\n"
        f"{dashboard.css}\n{dashboard.json_metadata}"
    )

    unique_string = _adjust_string_for_executor(unique_string, executor_type, executor)
    unique_string = _adjust_string_with_rls(
        unique_string, dashboard.datasources, executor
    )

    return hash_from_str(unique_string)


def get_chart_digest(chart: Slice) -> str | None:
    try:
        executor_type, executor = get_executor(
            executors=app.config["THUMBNAIL_EXECUTORS"],
            model=chart,
            current_user=get_current_user(),
        )
    except ExecutorNotFoundError:
        return None

    if func := app.config["THUMBNAIL_CHART_DIGEST_FUNC"]:
        return func(chart, executor_type, executor)

    unique_string = f"{chart.params or ''}.{executor}"
    unique_string = _adjust_string_for_executor(unique_string, executor_type, executor)
    unique_string = _adjust_string_with_rls(unique_string, [chart.table], executor)

    return hash_from_str(unique_string)
