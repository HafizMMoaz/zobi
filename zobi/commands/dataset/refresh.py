import logging
from functools import partial
from typing import Optional

from flask import current_app
from flask_appbuilder.models.sqla import Model

from zobi import security_manager
from zobi.commands.base import BaseCommand
from zobi.commands.dataset.exceptions import (
    DatasetForbiddenError,
    DatasetNotFoundError,
    DatasetRefreshFailedError,
)
from zobi.connectors.sqla.models import SqlaTable
from zobi.daos.dataset import DatasetDAO
from zobi.datasets.datetime_format_detector import DatetimeFormatDetector
from zobi.exceptions import ZobiSecurityException
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class RefreshDatasetCommand(BaseCommand):
    def __init__(self, model_id: int):
        self._model_id = model_id
        self._model: Optional[SqlaTable] = None

    @transaction(on_error=partial(on_error, reraise=DatasetRefreshFailedError))
    def run(self) -> Model:
        self.validate()
        assert self._model
        self._model.fetch_metadata()

        # Detect datetime formats if feature is enabled
        if current_app.config.get("DATASET_AUTO_DETECT_DATETIME_FORMATS", True):
            try:
                detector = DatetimeFormatDetector()
                detector.detect_all_formats(self._model)
                logger.info(
                    "Detected datetime formats for dataset %s", self._model.table_name
                )
            except Exception as ex:
                logger.exception(
                    "Failed to detect datetime formats for dataset %s: %s",
                    self._model.table_name,
                    str(ex),
                )

        return self._model

    def validate(self) -> None:
        # Validate/populate model exists
        self._model = DatasetDAO.find_by_id(self._model_id)
        if not self._model:
            raise DatasetNotFoundError()
        # Check ownership
        try:
            security_manager.raise_for_ownership(self._model)
        except ZobiSecurityException as ex:
            raise DatasetForbiddenError() from ex
