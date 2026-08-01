
import logging
from functools import partial

from zobi.commands.base import BaseCommand
from zobi.commands.security.exceptions import (
    RLSRuleNotFoundError,
    RuleDeleteFailedError,
)
from zobi.daos.security import RLSDAO
from zobi.reports.models import ReportSchedule
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteRLSRuleCommand(BaseCommand):
    def __init__(self, model_ids: list[int]):
        self._model_ids = model_ids
        self._models: list[ReportSchedule] = []

    @transaction(on_error=partial(on_error, reraise=RuleDeleteFailedError))
    def run(self) -> None:
        self.validate()
        RLSDAO.delete(self._models)

    def validate(self) -> None:
        # Validate/populate model exists
        self._models = RLSDAO.find_by_ids(self._model_ids)
        if not self._models or len(self._models) != len(self._model_ids):
            raise RLSRuleNotFoundError()
