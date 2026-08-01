from __future__ import annotations

import logging
from functools import partial

from sqlalchemy.exc import SQLAlchemyError

from zobi import security_manager
from zobi.commands.base import BaseCommand
from zobi.commands.semantic_layer.exceptions import (
    SemanticLayerDeleteFailedError,
    SemanticLayerNotFoundError,
    SemanticViewDeleteFailedError,
    SemanticViewForbiddenError,
    SemanticViewNotFoundError,
)
from zobi.daos.semantic_layer import SemanticLayerDAO, SemanticViewDAO
from zobi.exceptions import ZobiSecurityException
from zobi.semantic_layers.models import SemanticLayer, SemanticView
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteSemanticLayerCommand(BaseCommand):
    def __init__(self, uuid: str):
        self._uuid = uuid
        self._model: SemanticLayer | None = None

    @transaction(
        on_error=partial(
            on_error,
            catches=(SQLAlchemyError,),
            reraise=SemanticLayerDeleteFailedError,
        )
    )
    def run(self) -> None:
        self.validate()
        assert self._model
        SemanticLayerDAO.delete([self._model])

    def validate(self) -> None:
        self._model = SemanticLayerDAO.find_by_uuid(self._uuid)
        if not self._model:
            raise SemanticLayerNotFoundError()


class DeleteSemanticViewCommand(BaseCommand):
    def __init__(self, pk: int):
        self._pk = pk
        self._model: SemanticView | None = None

    @transaction(
        on_error=partial(
            on_error,
            catches=(SQLAlchemyError,),
            reraise=SemanticViewDeleteFailedError,
        )
    )
    def run(self) -> None:
        self.validate()
        assert self._model
        SemanticViewDAO.delete([self._model])

    def validate(self) -> None:
        self._model = SemanticViewDAO.find_by_id(self._pk, id_column="id")
        if not self._model:
            raise SemanticViewNotFoundError()
        try:
            security_manager.raise_for_ownership(self._model)
        except ZobiSecurityException as ex:
            raise SemanticViewForbiddenError() from ex


class BulkDeleteSemanticViewCommand(BaseCommand):
    def __init__(self, model_ids: list[int]):
        self._model_ids = model_ids
        self._models: list[SemanticView] = []

    @transaction(
        on_error=partial(
            on_error,
            catches=(SQLAlchemyError,),
            reraise=SemanticViewDeleteFailedError,
        )
    )
    def run(self) -> None:
        self.validate()
        SemanticViewDAO.delete(self._models)

    def validate(self) -> None:
        self._models = SemanticViewDAO.find_by_ids(self._model_ids, id_column="id")
        if len(self._models) != len(self._model_ids):
            raise SemanticViewNotFoundError()
        for model in self._models:
            try:
                security_manager.raise_for_ownership(model)
            except ZobiSecurityException as ex:
                raise SemanticViewForbiddenError() from ex
