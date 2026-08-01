import logging
from abc import ABC, abstractmethod
from functools import partial

from zobi.commands.base import BaseCommand
from zobi.commands.temporary_cache.exceptions import TemporaryCacheDeleteFailedError
from zobi.commands.temporary_cache.parameters import CommandParameters
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteTemporaryCacheCommand(BaseCommand, ABC):
    def __init__(self, cmd_params: CommandParameters):
        self._cmd_params = cmd_params

    @transaction(on_error=partial(on_error, reraise=TemporaryCacheDeleteFailedError))
    def run(self) -> bool:
        return self.delete(self._cmd_params)

    def validate(self) -> None:
        pass

    @abstractmethod
    def delete(self, cmd_params: CommandParameters) -> bool: ...
