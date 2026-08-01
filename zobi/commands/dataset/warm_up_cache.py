

from typing import Any, Optional

from zobi.commands.base import BaseCommand
from zobi.commands.chart.warm_up_cache import ChartWarmUpCacheCommand
from zobi.commands.dataset.exceptions import WarmUpCacheTableNotFoundError
from zobi.connectors.sqla.models import SqlaTable
from zobi.extensions import db
from zobi.models.core import Database
from zobi.models.slice import Slice


class DatasetWarmUpCacheCommand(BaseCommand):
    def __init__(
        self,
        db_name: str,
        table_name: str,
        dashboard_id: Optional[int],
        extra_filters: Optional[str],
    ):
        self._db_name = db_name
        self._table_name = table_name
        self._dashboard_id = dashboard_id
        self._extra_filters = extra_filters
        self._charts: list[Slice] = []

    def run(self) -> list[dict[str, Any]]:
        self.validate()
        return [
            ChartWarmUpCacheCommand(
                chart,
                self._dashboard_id,
                self._extra_filters,
            ).run()
            for chart in self._charts
        ]

    def validate(self) -> None:
        table = (
            db.session.query(SqlaTable)
            .join(Database)
            .filter(
                Database.database_name == self._db_name,
                SqlaTable.table_name == self._table_name,
            )
        ).one_or_none()
        if not table:
            raise WarmUpCacheTableNotFoundError()
        self._charts = (
            db.session.query(Slice)
            .filter_by(datasource_id=table.id, datasource_type=table.type)
            .all()
        )
