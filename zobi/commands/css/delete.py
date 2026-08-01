import logging
from functools import partial
from typing import Optional

from zobi.commands.base import BaseCommand
from zobi.commands.css.exceptions import (
    CssTemplateDeleteFailedError,
    CssTemplateNotFoundError,
)
from zobi.daos.css import CssTemplateDAO
from zobi.models.core import CssTemplate
from zobi.utils.decorators import on_error, transaction

logger = logging.getLogger(__name__)


class DeleteCssTemplateCommand(BaseCommand):
    def __init__(self, model_ids: list[int]):
        self._model_ids = model_ids
        self._models: Optional[list[CssTemplate]] = None

    @transaction(on_error=partial(on_error, reraise=CssTemplateDeleteFailedError))
    def run(self) -> None:
        self.validate()
        assert self._models
        CssTemplateDAO.delete(self._models)

    def validate(self) -> None:
        # Validate/populate model exists
        self._models = CssTemplateDAO.find_by_ids(self._model_ids)
        if not self._models or len(self._models) != len(self._model_ids):
            raise CssTemplateNotFoundError()
