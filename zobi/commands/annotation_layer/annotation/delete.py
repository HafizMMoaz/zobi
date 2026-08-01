import logging
from functools import partial
from typing import Optional

from zobi.commands.annotation_layer.annotation.exceptions import (
    AnnotationDeleteFailedError,
    AnnotationNotFoundError,
)
from zobi.commands.base import BaseCommand
from zobi.daos.annotation_layer import AnnotationDAO
from zobi.models.annotations import Annotation
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteAnnotationCommand(BaseCommand):
    def __init__(self, model_ids: list[int]):
        self._model_ids = model_ids
        self._models: Optional[list[Annotation]] = None

    @transaction(on_error=partial(on_error, reraise=AnnotationDeleteFailedError))
    def run(self) -> None:
        self.validate()
        assert self._models
        AnnotationDAO.delete(self._models)

    def validate(self) -> None:
        # Validate/populate model exists
        self._models = AnnotationDAO.find_by_ids(self._model_ids)
        if not self._models or len(self._models) != len(self._model_ids):
            raise AnnotationNotFoundError()
