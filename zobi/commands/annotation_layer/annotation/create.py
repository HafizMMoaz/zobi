import logging
from datetime import datetime
from functools import partial
from typing import Any, Optional

from flask_appbuilder.models.sqla import Model
from marshmallow import ValidationError

from zobi.commands.annotation_layer.annotation.exceptions import (
    AnnotationCreateFailedError,
    AnnotationDatesValidationError,
    AnnotationInvalidError,
    AnnotationUniquenessValidationError,
)
from zobi.commands.annotation_layer.exceptions import AnnotationLayerNotFoundError
from zobi.commands.base import BaseCommand
from zobi.daos.annotation_layer import AnnotationDAO, AnnotationLayerDAO
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class CreateAnnotationCommand(BaseCommand):
    def __init__(self, data: dict[str, Any]):
        self._properties = data.copy()

    @transaction(on_error=partial(on_error, reraise=AnnotationCreateFailedError))
    def run(self) -> Model:
        self.validate()
        return AnnotationDAO.create(attributes=self._properties)

    def validate(self) -> None:
        exceptions: list[ValidationError] = []
        layer_id: Optional[int] = self._properties.get("layer")
        start_dttm: Optional[datetime] = self._properties.get("start_dttm")
        end_dttm: Optional[datetime] = self._properties.get("end_dttm")
        short_descr = self._properties.get("short_descr", "")

        # Validate/populate model exists
        if not layer_id and not isinstance(layer_id, int):
            raise AnnotationLayerNotFoundError()
        annotation_layer = AnnotationLayerDAO.find_by_id(layer_id)
        if not annotation_layer:
            raise AnnotationLayerNotFoundError()
        self._properties["layer"] = annotation_layer

        # Validate short descr uniqueness on this layer
        if not AnnotationDAO.validate_update_uniqueness(layer_id, short_descr):
            exceptions.append(AnnotationUniquenessValidationError())

        # validate date time sanity
        if start_dttm and end_dttm and end_dttm < start_dttm:
            exceptions.append(AnnotationDatesValidationError())

        if exceptions:
            raise AnnotationInvalidError(exceptions=exceptions)
