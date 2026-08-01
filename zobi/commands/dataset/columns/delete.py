import logging
from functools import partial
from typing import Optional

from zobi import security_manager
from zobi.commands.base import BaseCommand
from zobi.commands.dataset.columns.exceptions import (
    DatasetColumnDeleteFailedError,
    DatasetColumnForbiddenError,
    DatasetColumnNotFoundError,
)
from zobi.connectors.sqla.models import TableColumn
from zobi.daos.dataset import DatasetColumnDAO, DatasetDAO
from zobi.exceptions import ZobiSecurityException
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteDatasetColumnCommand(BaseCommand):
    def __init__(self, dataset_id: int, model_id: int):
        self._dataset_id = dataset_id
        self._model_id = model_id
        self._model: Optional[TableColumn] = None

    @transaction(on_error=partial(on_error, reraise=DatasetColumnDeleteFailedError))
    def run(self) -> None:
        self.validate()
        assert self._model
        DatasetColumnDAO.delete([self._model])

    def validate(self) -> None:
        # Validate/populate model exists
        self._model = DatasetDAO.find_dataset_column(self._dataset_id, self._model_id)
        if not self._model:
            raise DatasetColumnNotFoundError()
        # Check ownership
        try:
            security_manager.raise_for_ownership(self._model)
        except ZobiSecurityException as ex:
            raise DatasetColumnForbiddenError() from ex
