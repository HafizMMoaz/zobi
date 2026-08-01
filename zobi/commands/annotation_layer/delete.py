import logging
from functools import partial
from typing import Optional

from zobi.commands.annotation_layer.exceptions import (
    AnnotationLayerDeleteFailedError,
    AnnotationLayerDeleteIntegrityError,
    AnnotationLayerNotFoundError,
)
from zobi.commands.base import BaseCommand
from zobi.daos.annotation_layer import AnnotationLayerDAO
from zobi.models.annotations import AnnotationLayer
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteAnnotationLayerCommand(BaseCommand):
    def __init__(self, model_ids: list[int]):
        self._model_ids = model_ids
        self._models: Optional[list[AnnotationLayer]] = None

    @transaction(on_error=partial(on_error, reraise=AnnotationLayerDeleteFailedError))
    def run(self) -> None:
        self.validate()
        assert self._models
        AnnotationLayerDAO.delete(self._models)

    def validate(self) -> None:
        # Validate/populate model exists
        self._models = AnnotationLayerDAO.find_by_ids(self._model_ids)
        if not self._models or len(self._models) != len(self._model_ids):
            raise AnnotationLayerNotFoundError()
        if AnnotationLayerDAO.has_annotations(self._model_ids):
            raise AnnotationLayerDeleteIntegrityError()
