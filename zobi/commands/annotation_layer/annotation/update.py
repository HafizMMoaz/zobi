import logging
from datetime import datetime
from functools import partial
from typing import Any, Optional

from flask_appbuilder.models.sqla import Model
from marshmallow import ValidationError

from zobi.commands.annotation_layer.annotation.exceptions import (
    AnnotationDatesValidationError,
    AnnotationInvalidError,
    AnnotationNotFoundError,
    AnnotationUniquenessValidationError,
    AnnotationUpdateFailedError,
)
from zobi.commands.annotation_layer.exceptions import AnnotationLayerNotFoundError
from zobi.commands.base import BaseCommand
from zobi.daos.annotation_layer import AnnotationDAO, AnnotationLayerDAO
from zobi.models.annotations import Annotation
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class UpdateAnnotationCommand(BaseCommand):
    def __init__(self, model_id: int, data: dict[str, Any]):
        self._model_id = model_id
        self._properties = data.copy()
        self._model: Optional[Annotation] = None

    @transaction(on_error=partial(on_error, reraise=AnnotationUpdateFailedError))
    def run(self) -> Model:
        self.validate()
        assert self._model
        return AnnotationDAO.update(self._model, self._properties)

    def validate(self) -> None:
        exceptions: list[ValidationError] = []
        layer_id: Optional[int] = self._properties.get("layer")
        short_descr: str = self._properties.get("short_descr", "")

        # Validate/populate model exists
        self._model = AnnotationDAO.find_by_id(self._model_id)
        if not self._model:
            raise AnnotationNotFoundError()
        # Validate/populate layer exists
        if layer_id:
            annotation_layer = AnnotationLayerDAO.find_by_id(layer_id)
            if not annotation_layer:
                raise AnnotationLayerNotFoundError()
            self._properties["layer"] = annotation_layer

            # Validate short descr uniqueness on this layer
            if not AnnotationDAO.validate_update_uniqueness(
                layer_id,
                short_descr,
                annotation_id=self._model_id,
            ):
                exceptions.append(AnnotationUniquenessValidationError())
        else:
            self._properties["layer"] = self._model.layer

        # validate date time sanity
        start_dttm: Optional[datetime] = self._properties.get("start_dttm")
        end_dttm: Optional[datetime] = self._properties.get("end_dttm")

        if start_dttm and end_dttm and end_dttm < start_dttm:
            exceptions.append(AnnotationDatesValidationError())

        if exceptions:
            raise AnnotationInvalidError(exceptions=exceptions)
