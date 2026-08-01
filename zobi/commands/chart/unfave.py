import logging
from functools import partial

from zobi.commands.base import BaseCommand
from zobi.commands.chart.exceptions import (
    ChartNotFoundError,
    ChartUnfaveError,
)
from zobi.daos.chart import ChartDAO
from zobi.models.slice import Slice
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DelFavoriteChartCommand(BaseCommand):
    def __init__(self, chart_id: int) -> None:
        self._chart_id = chart_id
        self._chart: Slice | None = None

    @transaction(on_error=partial(on_error, reraise=ChartUnfaveError))
    def run(self) -> None:
        self.validate()
        if self._chart:
            return ChartDAO.remove_favorite(self._chart)

    def validate(self) -> None:
        chart = ChartDAO.find_by_id(self._chart_id)
        if not chart:
            raise ChartNotFoundError()

        self._chart = chart
