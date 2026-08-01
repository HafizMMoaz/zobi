import logging
from abc import ABC, abstractmethod
from typing import Optional

from sqlalchemy.exc import SQLAlchemyError

from zobi.commands.base import BaseCommand
from zobi.commands.temporary_cache.exceptions import TemporaryCacheGetFailedError
from zobi.commands.temporary_cache.parameters import CommandParameters

logger = logging.getLogger(__name__)


class GetTemporaryCacheCommand(BaseCommand, ABC):
    def __init__(self, cmd_params: CommandParameters):
        self._cmd_params = cmd_params

    def run(self) -> Optional[str]:
        try:
            return self.get(self._cmd_params)
        except SQLAlchemyError as ex:
            logger.exception("Error running get command")
            raise TemporaryCacheGetFailedError() from ex

    def validate(self) -> None:
        pass

    @abstractmethod
    def get(self, cmd_params: CommandParameters) -> Optional[str]: ...
