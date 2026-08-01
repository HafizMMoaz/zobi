import logging
from functools import partial
from typing import Optional

from zobi import security_manager
from zobi.commands.base import BaseCommand
from zobi.commands.dataset.exceptions import (
    DatasetDeleteFailedError,
    DatasetForbiddenError,
    DatasetNotFoundError,
)
from zobi.connectors.sqla.models import SqlaTable
from zobi.daos.dataset import DatasetDAO
from zobi.exceptions import ZobiSecurityException
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteDatasetCommand(BaseCommand):
    def __init__(self, model_ids: list[int]):
        self._model_ids = model_ids
        self._models: Optional[list[SqlaTable]] = None

    @transaction(on_error=partial(on_error, reraise=DatasetDeleteFailedError))
    def run(self) -> None:
        self.validate()
        assert self._models
        DatasetDAO.delete(self._models)

    def validate(self) -> None:
        # Validate/populate model exists
        self._models = DatasetDAO.find_by_ids(self._model_ids)
        if not self._models or len(self._models) != len(self._model_ids):
            raise DatasetNotFoundError()
        # Check ownership
        for model in self._models:
            try:
                security_manager.raise_for_ownership(model)
            except ZobiSecurityException as ex:
                raise DatasetForbiddenError() from ex
