import logging
from functools import partial
from typing import Any, Optional

from flask_appbuilder.models.sqla import Model
from marshmallow import ValidationError

from zobi.commands.annotation_layer.exceptions import (
    AnnotationLayerInvalidError,
    AnnotationLayerNameUniquenessValidationError,
    AnnotationLayerNotFoundError,
    AnnotationLayerUpdateFailedError,
)
from zobi.commands.base import BaseCommand
from zobi.daos.annotation_layer import AnnotationLayerDAO
from zobi.models.annotations import AnnotationLayer
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class UpdateAnnotationLayerCommand(BaseCommand):
    def __init__(self, model_id: int, data: dict[str, Any]):
        self._model_id = model_id
        self._properties = data.copy()
        self._model: Optional[AnnotationLayer] = None

    @transaction(on_error=partial(on_error, reraise=AnnotationLayerUpdateFailedError))
    def run(self) -> Model:
        self.validate()
        assert self._model
        return AnnotationLayerDAO.update(self._model, self._properties)

    def validate(self) -> None:
        exceptions: list[ValidationError] = []
        name = self._properties.get("name", "")
        self._model = AnnotationLayerDAO.find_by_id(self._model_id)

        if not self._model:
            raise AnnotationLayerNotFoundError()

        if not AnnotationLayerDAO.validate_update_uniqueness(
            name, layer_id=self._model_id
        ):
            exceptions.append(AnnotationLayerNameUniquenessValidationError())

        if exceptions:
            raise AnnotationLayerInvalidError(exceptions=exceptions)
