import logging
from abc import ABC, abstractmethod
from functools import partial

from zobi.commands.base import BaseCommand
from zobi.commands.temporary_cache.exceptions import TemporaryCacheCreateFailedError
from zobi.commands.temporary_cache.parameters import CommandParameters
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class CreateTemporaryCacheCommand(BaseCommand, ABC):
    def __init__(self, cmd_params: CommandParameters):
        self._cmd_params = cmd_params

    @transaction(on_error=partial(on_error, reraise=TemporaryCacheCreateFailedError))
    def run(self) -> str:
        return self.create(self._cmd_params)

    def validate(self) -> None:
        pass

    @abstractmethod
    def create(self, cmd_params: CommandParameters) -> str: ...
