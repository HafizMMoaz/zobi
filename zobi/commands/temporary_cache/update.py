import logging
from abc import ABC, abstractmethod
from functools import partial
from typing import Optional

from zobi.commands.base import BaseCommand
from zobi.commands.temporary_cache.exceptions import TemporaryCacheUpdateFailedError
from zobi.commands.temporary_cache.parameters import CommandParameters
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class UpdateTemporaryCacheCommand(BaseCommand, ABC):
    def __init__(
        self,
        cmd_params: CommandParameters,
    ):
        self._parameters = cmd_params

    @transaction(on_error=partial(on_error, reraise=TemporaryCacheUpdateFailedError))
    def run(self) -> Optional[str]:
        return self.update(self._parameters)

    def validate(self) -> None:
        pass

    @abstractmethod
    def update(self, cmd_params: CommandParameters) -> Optional[str]: ...
