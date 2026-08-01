import logging
from functools import partial
from typing import Optional

from zobi.commands.base import BaseCommand
from zobi.commands.query.exceptions import (
    SavedQueryDeleteFailedError,
    SavedQueryNotFoundError,
)
from zobi.daos.query import SavedQueryDAO
from zobi.models.dashboard import Dashboard
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteSavedQueryCommand(BaseCommand):
    def __init__(self, model_ids: list[int]):
        self._model_ids = model_ids
        self._models: Optional[list[Dashboard]] = None

    @transaction(on_error=partial(on_error, reraise=SavedQueryDeleteFailedError))
    def run(self) -> None:
        self.validate()
        assert self._models
        SavedQueryDAO.delete(self._models)

    def validate(self) -> None:
        # Validate/populate model exists
        self._models = SavedQueryDAO.find_by_ids(self._model_ids)
        if not self._models or len(self._models) != len(self._model_ids):
            raise SavedQueryNotFoundError()
