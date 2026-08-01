import logging
from functools import partial
from typing import Any

from flask_appbuilder.models.sqla import Model
from marshmallow import ValidationError

from zobi.commands.annotation_layer.exceptions import (
    AnnotationLayerCreateFailedError,
    AnnotationLayerInvalidError,
    AnnotationLayerNameUniquenessValidationError,
)
from zobi.commands.base import BaseCommand
from zobi.daos.annotation_layer import AnnotationLayerDAO
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class CreateAnnotationLayerCommand(BaseCommand):
    def __init__(self, data: dict[str, Any]):
        self._properties = data.copy()

    @transaction(on_error=partial(on_error, reraise=AnnotationLayerCreateFailedError))
    def run(self) -> Model:
        self.validate()
        return AnnotationLayerDAO.create(attributes=self._properties)

    def validate(self) -> None:
        exceptions: list[ValidationError] = []

        name = self._properties.get("name", "")

        if not AnnotationLayerDAO.validate_update_uniqueness(name):
            exceptions.append(AnnotationLayerNameUniquenessValidationError())

        if exceptions:
            raise AnnotationLayerInvalidError(exceptions=exceptions)
